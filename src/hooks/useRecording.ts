import { useCallback } from 'react';

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

      // Create MediaRecorder from canvas stream (like HTML file - 30 FPS)
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
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
        a.download = `mockup-export-${Date.now()}.webm`;
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

      // Function to draw frames to canvas (similar to HTML file)
      const drawFrame = async () => {
        try {
          // Capture the app container background (like SVG in HTML file)
          const html2canvas = (await import('html2canvas')).default;
          const capturedCanvas = await html2canvas(appContainer, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            logging: false,
            width: rect.width,
            height: rect.height,
            ignoreElements: (element) => element.tagName === 'VIDEO',
          });

          // Draw captured content (background)
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(capturedCanvas, 0, 0, canvas.width, canvas.height);
          
          // Draw video manually with proper clipping (like HTML file approach)
          if (video && video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
            const videoRect = video.getBoundingClientRect();
            const appRect = appContainer.getBoundingClientRect();
            
            const videoX = videoRect.left - appRect.left;
            const videoY = videoRect.top - appRect.top;
            const videoWidth = videoRect.width;
            const videoHeight = videoRect.height;
            
            // Save context state
            ctx.save();
            
            // Create clipping path to match the iPhone mockup border radius
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

      // Recording loop (like HTML file)
      let isRecording = true;
      const drawFramesContinuously = () => {
        if (isRecording) {
          drawFrame();
          requestAnimationFrame(drawFramesContinuously);
        }
      };

      // Start recording (like HTML file)
      video.currentTime = 0;
      await video.play();
      mediaRecorder.start();
      console.log('MediaRecorder started');

      // Start drawing frames continuously
      drawFramesContinuously();

      // Stop recording when video ends or after 10 seconds (like HTML file)
      const maxDuration = Math.min(video.duration * 1000, 10000);
      setTimeout(() => {
        isRecording = false;
        mediaRecorder.stop();
        video.pause();
        console.log('Recording stopped after', maxDuration, 'ms');
      }, maxDuration);

    } catch (error) {
      console.error('Error during screen recording:', error);
      setAreSidebarsVisible(true);
    }
  }, [appContainerRef, videoRef, setAreSidebarsVisible]);

  return { exportRecording };
} 