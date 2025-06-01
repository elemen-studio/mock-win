import { useCallback } from 'react';

const BUFFER_DURATION = 3000; // 3 seconds in milliseconds
const FPS = 60; // Increased to 60 FPS

interface UseScreenRecorderProps {
  appContainerRef: React.RefObject<HTMLElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  setAreSidebarsVisible: (visible: boolean) => void;
}

export function useScreenRecorder({
  appContainerRef,
  videoRef,
  setAreSidebarsVisible,
}: UseScreenRecorderProps) {
  const exportRecording = useCallback(async () => {
    const appContainer = appContainerRef.current;
    const video = videoRef.current;

    if (!appContainer || !video) {
      console.error('App container or video element not found');
      return;
    }

    console.log('Starting export process...');
    
    try {
      // Hide sidebars for clean recording
      setAreSidebarsVisible(false);
      console.log('Sidebars hidden');

      // Give a moment for the UI to update
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create canvas for recording
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Cannot get canvas context');
      }

      // Set canvas size to match app container
      const rect = appContainer.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      console.log(`Canvas size: ${canvas.width}x${canvas.height}`);

      // Create MediaRecorder from canvas stream at 60 FPS
      const stream = canvas.captureStream(FPS);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: Math.max(8_000_000, canvas.width * canvas.height * 2) // Higher bitrate for 60 FPS
      });

      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          console.log(`Recorded chunk: ${event.data.size} bytes`);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Recording stopped, creating download...');
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mockup-export-60fps-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Restore sidebars
        setAreSidebarsVisible(true);
        console.log('Export completed!');
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setAreSidebarsVisible(true);
      };

      // Function to draw frames to canvas
      const drawFrame = async () => {
        try {
          const html2canvas = (await import('html2canvas')).default;
          
          const capturedCanvas = await html2canvas(appContainer, {
            useCORS: true,
            allowTaint: true,
            scale: window.devicePixelRatio || 1, // Use device pixel ratio for crisp capture
            backgroundColor: null,
            logging: false,
            width: rect.width,
            height: rect.height,
            ignoreElements: (element) => element.tagName === 'VIDEO',
            // Ensure we capture CSS styles including border-radius
            foreignObjectRendering: true,
            imageTimeout: 0,
            removeContainer: true
          });

          // Draw captured content (this includes the iPhone mockup with border radius)
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(capturedCanvas, 0, 0, canvas.width, canvas.height);
          
          // Draw video manually with proper clipping to match iPhone mockup
          if (video && video.videoWidth > 0 && video.videoHeight > 0) {
            const videoRect = video.getBoundingClientRect();
            const appRect = appContainer.getBoundingClientRect();
            
            const videoX = videoRect.left - appRect.left;
            const videoY = videoRect.top - appRect.top;
            const videoWidth = videoRect.width;
            const videoHeight = videoRect.height;
            
            // Save context state
            ctx.save();
            
            // Create clipping path to match the iPhone mockup border radius (52px)
            const borderRadius = 52;
            ctx.beginPath();
            ctx.roundRect(videoX, videoY, videoWidth, videoHeight, borderRadius);
            ctx.clip();
            
            // Draw the video content within the clipped area
            ctx.drawImage(video, videoX, videoY, videoWidth, videoHeight);
            
            // Restore context state
            ctx.restore();
          }
        } catch (error) {
          console.error('Error drawing frame:', error);
        }
      };

      // Start recording
      mediaRecorder.start();
      console.log('MediaRecorder started at 60 FPS');

      // Initial buffer
      console.log('Starting buffer period...');
      await new Promise(resolve => setTimeout(resolve, BUFFER_DURATION));

      // Start video
      video.currentTime = 0;
      await video.play();
      console.log('Video started playing');

      // Recording loop at 60 FPS
      const frameInterval = 1000 / FPS; // ~16.67ms for 60 FPS
      const videoDuration = video.duration * 1000;
      const totalDuration = videoDuration + BUFFER_DURATION;
      
      let startTime = Date.now();
      const recordingLoop = async () => {
        const elapsed = Date.now() - startTime;
        
        if (elapsed < totalDuration) {
          await drawFrame();
          setTimeout(recordingLoop, frameInterval);
        } else {
          console.log('Recording duration completed, stopping...');
          mediaRecorder.stop();
        }
      };

      // Start the recording loop
      recordingLoop();

    } catch (error) {
      console.error('Error during screen recording:', error);
      setAreSidebarsVisible(true);
    }
  }, [appContainerRef, videoRef, setAreSidebarsVisible]);

  return { exportRecording };
} 