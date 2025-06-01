import { useCallback, useState } from 'react';

interface UseScreenRecorderProps {
  appContainerRef: React.RefObject<HTMLElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  setAreSidebarsVisible: (visible: boolean) => void;
}

export interface RecordingProgress {
  isRecording: boolean;
  progress: number; // 0-100
  elapsedTime: number; // in seconds
  totalTime: number; // in seconds
  status: string;
}

export function useScreenRecorder({
  appContainerRef,
  videoRef,
  setAreSidebarsVisible,
}: UseScreenRecorderProps) {
  const [recordingProgress, setRecordingProgress] = useState<RecordingProgress>({
    isRecording: false,
    progress: 0,
    elapsedTime: 0,
    totalTime: 0,
    status: '',
  });

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

      setRecordingProgress({
        isRecording: true,
        progress: 0,
        elapsedTime: 0,
        totalTime: 0,
        status: 'Preparing...',
      });

      // Give a moment for the UI to update
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create canvas for recording - USE FULL APP CONTAINER SIZE
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Cannot get canvas context');
      }

      // Use the FULL app container dimensions (entire page)
      const appRect = appContainer.getBoundingClientRect();
      canvas.width = appRect.width;
      canvas.height = appRect.height;
      console.log(`Canvas size set to full page: ${canvas.width}x${canvas.height}`);

      setRecordingProgress(prev => ({ ...prev, status: 'Pre-rendering background...' }));

      // PRE-RENDER ENTIRE APP BACKGROUND ONCE (includes mockup + frame)
      let backgroundImage: HTMLCanvasElement | null = null;
      
      try {
        console.log('Pre-rendering entire app background...');
        const html2canvas = (await import('html2canvas')).default;
        backgroundImage = await html2canvas(appContainer, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          logging: false,
          width: appRect.width,
          height: appRect.height,
          ignoreElements: (element) => element.tagName === 'VIDEO',
          scale: 1,
        });
        console.log('App background pre-rendered successfully');
      } catch (error) {
        console.warn('Failed to pre-render background, will use fallback:', error);
      }

      // Create MediaRecorder from canvas stream (30 FPS)
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
        
        setRecordingProgress(prev => ({ ...prev, status: 'Creating video file...' }));
        
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `full-page-mockup-export-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Reset progress state
        setRecordingProgress({
          isRecording: false,
          progress: 100,
          elapsedTime: 0,
          totalTime: 0,
          status: 'Export completed!',
        });

        // Clear status after 2 seconds
        setTimeout(() => {
          setRecordingProgress(prev => ({ ...prev, status: '' }));
        }, 2000);

        // Restore sidebars
        setAreSidebarsVisible(true);
        console.log('Export completed!');
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setRecordingProgress({
          isRecording: false,
          progress: 0,
          elapsedTime: 0,
          totalTime: 0,
          status: 'Recording failed',
        });
        setAreSidebarsVisible(true);
      };

      // Calculate recording duration
      const maxDuration = Math.min(video.duration * 1000, 10000);
      const totalTimeSeconds = maxDuration / 1000;

      setRecordingProgress(prev => ({ 
        ...prev, 
        totalTime: totalTimeSeconds,
        status: 'Recording...' 
      }));

      // OPTIMIZED frame drawing function
      const drawFrame = () => {
        try {
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw pre-rendered app background (includes entire page with mockup frame)
          if (backgroundImage) {
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
          } else {
            // Fallback: simple background color
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          
          // Draw video within the phone screen area
          if (video && video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
            // Get video position relative to the FULL APP CONTAINER
            const videoRect = video.getBoundingClientRect();
            const appRect = appContainer.getBoundingClientRect();
            
            // Calculate video position within the full page
            const videoX = videoRect.left - appRect.left;
            const videoY = videoRect.top - appRect.top;
            const videoWidth = videoRect.width;
            const videoHeight = videoRect.height;
            
            // Save context state
            ctx.save();
            
            // Create clipping path for the video area (rounded corners for iPhone)
            const borderRadius = 52; // iPhone mockup border radius
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

      // Recording loop with optimized frame drawing and progress tracking
      let isRecording = true;
      let frameCount = 0;
      const startTime = Date.now();
      
      const drawFramesContinuously = () => {
        if (isRecording) {
          drawFrame();
          frameCount++;
          
          // Update progress
          const elapsed = Date.now() - startTime;
          const elapsedSeconds = elapsed / 1000;
          const progress = Math.min((elapsed / maxDuration) * 100, 100);
          
          setRecordingProgress(prev => ({
            ...prev,
            progress,
            elapsedTime: elapsedSeconds,
          }));
          
          // Log progress every 30 frames (1 second at 30fps)
          if (frameCount % 30 === 0) {
            console.log(`Recorded ${frameCount} frames - ${progress.toFixed(1)}% complete`);
          }
          
          requestAnimationFrame(drawFramesContinuously);
        }
      };

      // Start recording
      video.currentTime = 0;
      await video.play();
      mediaRecorder.start();
      console.log('MediaRecorder started');

      // Start drawing frames continuously
      drawFramesContinuously();

      // Stop recording when video ends or after 10 seconds (like HTML version)
      setTimeout(() => {
        isRecording = false;
        mediaRecorder.stop();
        video.pause();
        console.log(`Recording stopped after ${maxDuration}ms, total frames: ${frameCount}`);
      }, maxDuration);

    } catch (error) {
      console.error('Error during screen recording:', error);
      setRecordingProgress({
        isRecording: false,
        progress: 0,
        elapsedTime: 0,
        totalTime: 0,
        status: 'Export failed',
      });
      setAreSidebarsVisible(true);
    }
  }, [appContainerRef, videoRef, setAreSidebarsVisible]);

  return { exportRecording, recordingProgress };
}
