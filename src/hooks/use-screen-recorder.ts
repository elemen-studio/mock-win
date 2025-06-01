import { useCallback, useState } from 'react';

const BUFFER_DURATION = 3000; // 3 seconds in milliseconds

// VideoCanvasRef interface to match the canvas-based Video component
type VideoCanvasRef = {
  play: () => Promise<void>
  pause: () => void
  currentTime: number
  duration: number
  paused: boolean
  videoWidth: number
  videoHeight: number
}

interface UseScreenRecorderProps {
  appContainerRef: React.RefObject<HTMLElement | null>;
  videoRef: React.RefObject<VideoCanvasRef | null>;
  setAreSidebarsVisible: (visible: boolean) => void;
}

export function useScreenRecorder({
  appContainerRef,
  videoRef,
  setAreSidebarsVisible,
}: UseScreenRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);

  const exportRecording = useCallback(async () => {
    const appContainer = appContainerRef.current;
    const video = videoRef.current;

    if (!appContainer || !video) {
      console.error('App container or video element not found');
      return;
    }

    console.log('Starting canvas capture stream recording...');
    
    let mediaRecorder: MediaRecorder | null = null;
    
    try {
      setIsRecording(true);
      setProgress(0);

      // Hide sidebars for clean recording
      setAreSidebarsVisible(false);
      console.log('Sidebars hidden');

      // Give a moment for the UI to update
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create canvas for recording
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!ctx) {
        throw new Error('Cannot get canvas context');
      }

      // Set canvas size to match app container
      const rect = appContainer.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      console.log(`Canvas size: ${canvas.width}x${canvas.height}`);

      // Calculate recording duration
      const videoDuration = video.duration || 10;
      const totalDurationMs = videoDuration * 1000 + (BUFFER_DURATION * 2);

      // Create MediaRecorder from canvas stream
      const stream = canvas.captureStream(30); // 30 FPS
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: Math.min(8_000_000, canvas.width * canvas.height * 2)
      });

      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Recording stopped, creating download...');
        
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mockup-export-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Reset state
        setIsRecording(false);
        setProgress(0);
        setAreSidebarsVisible(true);
        console.log('Canvas capture stream recording completed!');
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setIsRecording(false);
        setProgress(0);
        setAreSidebarsVisible(true);
      };

      // Function to capture and composite frame
      const captureFrame = async () => {
        try {
          // Import html2canvas
          const html2canvas = (await import('html2canvas')).default;
          
          // Capture DOM including canvas-based video (no CORS issues!)
          const capturedCanvas = await html2canvas(appContainer, {
            useCORS: true,
            allowTaint: true,
            scale: 1,
            backgroundColor: null,
            logging: false,
            width: rect.width,
            height: rect.height,
            foreignObjectRendering: true,
            removeContainer: true
          });

          // Clear and draw to our canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(capturedCanvas, 0, 0);
          
          // Draw progress bar overlay
          if (progress > 0) {
            const progressBarY = 30;
            const progressBarHeight = 6;
            const progressBarWidth = 300;
            const progressBarX = (canvas.width - progressBarWidth) / 2;
            
            // Semi-transparent background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(progressBarX - 10, progressBarY - 10, progressBarWidth + 20, 40);
            
            // Progress bar background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
            
            // Progress fill
            ctx.fillStyle = '#6B7280';
            ctx.fillRect(progressBarX, progressBarY, (progressBarWidth * progress) / 100, progressBarHeight);
            
            // Progress text
            ctx.fillStyle = 'white';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`Recording ${Math.round(progress)}%`, canvas.width / 2, progressBarY + 25);
          }
          
        } catch (error) {
          console.error('Error capturing frame:', error);
        }
      };

      // Start recording
      mediaRecorder.start();
      console.log('Canvas capture stream started at 30 FPS');

      // Initial buffer period
      console.log('Starting buffer period...');
      await new Promise(resolve => setTimeout(resolve, BUFFER_DURATION));

      // Start video
      video.currentTime = 0;
      await video.play();
      console.log('Video started playing');

      // Recording loop
      const startTime = Date.now();
      
      const recordingLoop = async () => {
        if (!mediaRecorder || mediaRecorder.state !== 'recording') {
          console.log('MediaRecorder not recording, stopping loop');
          return;
        }
        
        const elapsed = Date.now() - startTime;
        const progressPercent = Math.min((elapsed / totalDurationMs) * 100, 100);
        setProgress(progressPercent);
        
        // Capture current frame
        await captureFrame();
        
        // Check if we've reached the end
        if (elapsed >= totalDurationMs || progressPercent >= 100) {
          console.log('Recording duration completed, stopping...');
          mediaRecorder.stop();
          return;
        }
        
        // Continue recording
        requestAnimationFrame(recordingLoop);
      };

      // Start the recording loop
      recordingLoop();

    } catch (error) {
      console.error('Error during canvas capture stream recording:', error);
      setIsRecording(false);
      setProgress(0);
      setAreSidebarsVisible(true);
      
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        try {
          mediaRecorder.stop();
        } catch (stopError) {
          console.error('Error stopping recorder:', stopError);
        }
      }
    }
  }, [appContainerRef, videoRef, setAreSidebarsVisible]);

  return { 
    exportRecording,
    isRecording,
    progress
  };
} 