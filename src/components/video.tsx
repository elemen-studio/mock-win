import { forwardRef, useEffect, useRef, useImperativeHandle } from 'react'

interface VideoProps {
  src: string
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  playsInline?: boolean
  className?: string
}

// Create a ref interface that matches HTMLVideoElement for compatibility
interface VideoCanvasRef {
  play: () => Promise<void>
  pause: () => void
  currentTime: number
  duration: number
  paused: boolean
  videoWidth: number
  videoHeight: number
}

export const Video = forwardRef<VideoCanvasRef, VideoProps>(function Video({ 
  src, 
  autoPlay = true, 
  loop = true, 
  muted = true, 
  playsInline = true,
  className = ""
}, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const animationFrameRef = useRef<number>()

  // Expose video-like interface through ref
  useImperativeHandle(ref, () => ({
    play: async () => {
      if (videoRef.current) {
        return videoRef.current.play()
      }
      return Promise.resolve()
    },
    pause: () => {
      if (videoRef.current) {
        videoRef.current.pause()
      }
    },
    get currentTime() {
      return videoRef.current?.currentTime || 0
    },
    set currentTime(time: number) {
      if (videoRef.current) {
        videoRef.current.currentTime = time
      }
    },
    get duration() {
      return videoRef.current?.duration || 0
    },
    get paused() {
      return videoRef.current?.paused || true
    },
    get videoWidth() {
      return videoRef.current?.videoWidth || 0
    },
    get videoHeight() {
      return videoRef.current?.videoHeight || 0
    }
  }), [])

  const drawVideoFrame = () => {
    const canvas = canvasRef.current
    const video = videoRef.current
    
    if (canvas && video && video.videoWidth > 0 && video.videoHeight > 0) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Set canvas size to match video
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
        }
        
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      }
    }
    
    // Continue animation if video is playing
    if (video && !video.paused && !video.ended) {
      animationFrameRef.current = requestAnimationFrame(drawVideoFrame)
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      drawVideoFrame()
      // Auto-start video if autoPlay is enabled
      if (autoPlay && video.paused) {
        video.play().catch(error => {
          console.log('Auto-play failed:', error)
        })
      }
    }

    const handlePlay = () => {
      drawVideoFrame()
    }

    const handlePause = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }

    const handleEnded = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    // Also try to start immediately if video is already loaded
    if (video.readyState >= 2 && autoPlay && video.paused) {
      video.play().catch(error => {
        console.log('Auto-play failed:', error)
      })
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [src, autoPlay])

  return (
    <>
      {/* Hidden video element for actual video loading and playback */}
      <video 
        ref={videoRef}
        src={src}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        style={{ display: 'none' }}
      />
      
      {/* Canvas that displays the video frames */}
      <canvas 
        ref={canvasRef}
        className={`w-full h-full object-cover ${className}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </>
  )
}) 