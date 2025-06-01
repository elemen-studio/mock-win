import { forwardRef } from 'react';

interface VideoProps {
  src: string
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  playsInline?: boolean
  className?: string
}

export const Video = forwardRef<HTMLVideoElement, VideoProps>(({ 
  src, 
  autoPlay = true, 
  loop = true, 
  muted = true, 
  playsInline = true,
  className = ""
}, ref) => {
  return (
    <video 
      ref={ref}
      src={src}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline={playsInline}
      className={`w-full h-full object-cover ${className}`}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }}
    />
  )
});

Video.displayName = 'Video';