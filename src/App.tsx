import { useState, useEffect, useRef, useCallback } from "react";
import { IPhoneMockup } from "@/components/iphone-mockup";
import { ControlBar } from "@/components/control-bar";

// Helper function to get ready state text
const getReadyStateText = (readyState: number): string => {
  switch (readyState) {
    case 0: return 'HAVE_NOTHING';
    case 1: return 'HAVE_METADATA';
    case 2: return 'HAVE_CURRENT_DATA';
    case 3: return 'HAVE_FUTURE_DATA';
    case 4: return 'HAVE_ENOUGH_DATA';
    default: return `Unknown (${readyState})`;
  }
};

function App() {
  const [currentVideoSrc, setCurrentVideoSrc] = useState("/ss.mp4");
  const [isControlBarVisible, setIsControlBarVisible] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if ((event.target as HTMLElement)?.tagName === 'INPUT' || 
          (event.target as HTMLElement)?.tagName === 'TEXTAREA') {
        return;
      }

      // Cmd+K or Ctrl+K to toggle control bar
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        event.stopPropagation();
        setIsControlBarVisible(prev => !prev);
        return;
      }

      // ESC to close control bar (only when visible)
      if (event.key === 'Escape' && isControlBarVisible) {
        event.preventDefault();
        event.stopPropagation();
        setIsControlBarVisible(false);
        return;
      }
    };

    document.addEventListener('keydown', handleKeydown, true);

    return () => {
      document.removeEventListener('keydown', handleKeydown, true);
    };
  }, [isControlBarVisible]);

  const handleVideoSelect = (videoSrc: string) => {
    setCurrentVideoSrc(videoSrc);
    setIsControlBarVisible(false);
  };

  const handleCloseControlBar = () => {
    setIsControlBarVisible(false);
  };

  const testCapture = useCallback(async () => {
    if (!videoRef.current || !svgRef.current) {
      console.error('Refs not available');
      alert('Video or SVG reference not available');
      return;
    }

    const video = videoRef.current;
    const svg = svgRef.current;
    
    console.log('Video state:', {
      readyState: video.readyState,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      src: video.src,
      currentTime: video.currentTime,
      duration: video.duration
    });
    
    // Create a canvas
    const canvas = document.createElement('canvas');
    canvas.width = 385;
    canvas.height = 785;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      console.error('Could not get 2D context');
      return;
    }
    
    // TypeScript now knows ctx is not null after this check
    const safeCtx = ctx;

    // Draw background
    safeCtx.fillStyle = 'white';
    safeCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    try {
      // Check if video is ready
      if (video.readyState < 2) { // Less than HAVE_CURRENT_DATA
        throw new Error(`Video not ready (readyState: ${video.readyState})`);
      }
      
      // Check if video has valid dimensions
      if (!video.videoWidth || !video.videoHeight) {
        throw new Error(`Invalid video dimensions: ${video.videoWidth}x${video.videoHeight}`);
      }
      
      // Calculate aspect ratio
      const videoAspect = video.videoWidth / video.videoHeight;
      const canvasAspect = canvas.width / canvas.height;
      let drawWidth, drawHeight, x = 0, y = 0;
      
      if (videoAspect > canvasAspect) {
        // Video is wider than canvas
        drawHeight = canvas.height;
        drawWidth = drawHeight * videoAspect;
        x = (canvas.width - drawWidth) / 2;
      } else {
        // Video is taller than canvas
        drawWidth = canvas.width;
        drawHeight = drawWidth / videoAspect;
        y = (canvas.height - drawHeight) / 2;
      }
      
      // Draw the video frame
      safeCtx.drawImage(video, x, y, drawWidth, drawHeight);
      console.log('Successfully drew video frame');
      
      // Add debug info
      safeCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      safeCtx.fillRect(10, 10, 300, 100);
      safeCtx.fillStyle = 'white';
      safeCtx.font = '12px Arial';
      safeCtx.textAlign = 'left';
      safeCtx.fillText(`Video: ${video.videoWidth}x${video.videoHeight}`, 20, 30);
      safeCtx.fillText(`Canvas: ${canvas.width}x${canvas.height}`, 20, 50);
      safeCtx.fillText(`Position: ${x.toFixed(1)},${y.toFixed(1)}`, 20, 70);
      safeCtx.fillText(`Size: ${drawWidth.toFixed(1)}x${drawHeight.toFixed(1)}`, 20, 90);
      
      // Display the canvas on screen
      canvas.style.position = 'fixed';
      canvas.style.top = '20px';
      canvas.style.left = '20px';
      canvas.style.border = '2px solid red';
      canvas.style.zIndex = '1000';
      
      // Remove any existing debug canvas
      const existingCanvas = document.getElementById('debug-canvas');
      if (existingCanvas) {
        document.body.removeChild(existingCanvas);
      }
      
      canvas.id = 'debug-canvas';
      document.body.appendChild(canvas);
      
      // Auto-remove after 10 seconds
      setTimeout(() => {
        if (document.body.contains(canvas)) {
          document.body.removeChild(canvas);
        }
      }, 10000);
      
      return true; // Success
    } catch (e) {
      console.error('Error drawing video frame:', e);
      // Fallback to drawing a placeholder with error details
      safeCtx.fillStyle = '#ffebee';
      safeCtx.fillRect(0, 0, canvas.width, canvas.height);
      safeCtx.fillStyle = '#b71c1c';
      safeCtx.textAlign = 'center';
      safeCtx.font = '16px Arial';
      safeCtx.fillText('❌ Could not draw video frame', canvas.width/2, canvas.height/2 - 40);
      
      // Show video state info
      safeCtx.font = '14px Arial';
      safeCtx.fillText(`ReadyState: ${video.readyState} (${getReadyStateText(video.readyState)})`, canvas.width/2, canvas.height/2 - 10);
      safeCtx.fillText(`Source: ${video.src.substring(0, 50)}${video.src.length > 50 ? '...' : ''}`, canvas.width/2, canvas.height/2 + 20);
      
      if (e instanceof Error) {
        safeCtx.fillText(e.message, canvas.width/2, canvas.height/2 + 50);
      }
      
      // Display the error canvas
      canvas.style.position = 'fixed';
      canvas.style.top = '20px';
      canvas.style.left = '20px';
      canvas.style.border = '2px solid #b71c1c';
      canvas.style.zIndex = '1000';
      
      // Remove any existing debug canvas
      const existingCanvas = document.getElementById('debug-canvas');
      if (existingCanvas) {
        document.body.removeChild(existingCanvas);
      }
      
      canvas.id = 'debug-canvas';
      document.body.appendChild(canvas);
      
      // Auto-remove after 10 seconds
      setTimeout(() => {
        if (document.body.contains(canvas)) {
          document.body.removeChild(canvas);
        }
      }, 10000);
      
      return false; // Failure
    }

    try {
      // Draw the SVG to canvas
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          safeCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(svgUrl);
          resolve();
        };
        img.onerror = () => {
          URL.revokeObjectURL(svgUrl);
          reject(new Error('Failed to load SVG image'));
        };
        img.src = svgUrl;
      });
      
      console.log('Successfully drew SVG');
    } catch (e) {
      console.error('Error drawing SVG:', e);
      throw e; // Re-throw to be caught by the outer catch
    }

    // Display the canvas on screen for debugging
    canvas.style.border = '1px solid red';
    canvas.style.position = 'fixed';
    canvas.style.top = '10px';
    canvas.style.left = '10px';
    canvas.style.zIndex = '1000';
    document.body.appendChild(canvas);
    
    // Add a way to remove the canvas
    setTimeout(() => {
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
    }, 5000);
  }, []);

  const handleExport = useCallback(async () => {
    console.log('Export started');
    const video = videoRef.current;
    const svg = svgRef.current;
    
    if (!video || !svg) {
      console.error('Video or SVG ref not available');
      alert('Video or SVG reference not available');
      return false;
    }

    // Ensure video is loaded and ready
    if (video.readyState < 2) {
      alert('Please wait for the video to load before exporting');
      return false;
    }

    setIsExporting(true);
    
    try {
      // Create canvas for drawing
      const canvas = document.createElement('canvas');
      canvas.width = 385;  // Match iPhone mockup dimensions
      canvas.height = 785;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!ctx) {
        throw new Error('Could not get 2D context');
      }
      
      // TypeScript now knows ctx is not null after this check
      const safeCtx = ctx;

      // Create SVG image element
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const svgImg = new Image();
      await new Promise<void>((resolve, reject) => {
        svgImg.onload = () => {
          URL.revokeObjectURL(svgUrl);
          resolve();
        };
        svgImg.onerror = () => {
          URL.revokeObjectURL(svgUrl);
          reject(new Error('Failed to load SVG image'));
        };
        svgImg.src = svgUrl;
      });

      // Set up MediaRecorder
      const stream = canvas.captureStream(30); // 30 FPS
      const mimeType = 'video/webm;codecs=vp9';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];
      
      // Function to draw a single frame
      const drawFrame = () => {
        try {
          // Clear canvas
          safeCtx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw video with rounded corners (screen area)
          const screenX = 19;
          const screenY = 14;
          const screenW = 349;
          const screenH = 757;
          const radius = 50;
          
          // Draw video with rounded corners
          safeCtx.save();
          safeCtx.beginPath();
          safeCtx.roundRect(screenX, screenY, screenW, screenH, radius);
          safeCtx.clip();
          
          // Draw video (scaled to fit)
          const videoAspect = video.videoWidth / video.videoHeight;
          const screenAspect = screenW / screenH;
          
          let drawWidth, drawHeight, x, y;
          
          if (videoAspect > screenAspect) {
            // Video is wider than screen
            drawHeight = screenH;
            drawWidth = drawHeight * videoAspect;
            x = screenX + (screenW - drawWidth) / 2;
            y = screenY;
          } else {
            // Video is taller than screen
            drawWidth = screenW;
            drawHeight = drawWidth / videoAspect;
            x = screenX;
            y = screenY + (screenH - drawHeight) / 2;
          }
          
          // Draw the video frame
          safeCtx.drawImage(video, x, y, drawWidth, drawHeight);
          safeCtx.restore();
          
          // Draw the SVG overlay
          safeCtx.drawImage(svgImg, 0, 0, canvas.width, canvas.height);
          
          return true;
        } catch (e) {
          console.error('Error drawing frame:', e);
          return false;
        }
      };
      
      // Set up MediaRecorder event handlers
      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      // Create a promise that resolves when recording is complete
      const recordingPromise = new Promise<Blob>((resolve, reject) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          if (blob.size === 0) {
            reject(new Error('Exported video is empty'));
            return;
          }
          resolve(blob);
        };
        
        mediaRecorder.onerror = (e) => {
          reject(new Error(`MediaRecorder error: ${e}`));
        };
      });
      
      // Start the recording process
      return new Promise<boolean>(async (resolve) => {
        try {
          // Draw initial frame
          video.currentTime = 0;
          
          // Wait for video to seek
          await new Promise<void>((resolveSeek) => {
            const onSeeked = () => {
              video.removeEventListener('seeked', onSeeked);
              resolveSeek();
            };
            video.addEventListener('seeked', onSeeked, { once: true });
          });
          
          // Start recording
          mediaRecorder.start(100); // Request data every 100ms
          
          // Draw frames at 30fps
          const startTime = performance.now();
          const maxDuration = Math.min(10, video.duration); // Max 10 seconds or video duration
          
          const drawLoop = () => {
            const currentTime = (performance.now() - startTime) / 1000;
            
            if (currentTime >= maxDuration || video.ended) {
              mediaRecorder.stop();
              return;
            }
            
            // Update video time
            video.currentTime = Math.min(currentTime, video.duration);
            
            // Draw frame
            if (!drawFrame()) {
              mediaRecorder.stop();
              throw new Error('Error drawing frame');
            }
            
            requestAnimationFrame(drawLoop);
          };
          
          // Start the drawing loop
          drawLoop();
          
          // Wait for recording to complete
          const blob = await recordingPromise;
          
          // Create download link
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `export-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.webm`;
          document.body.appendChild(a);
          a.click();
          
          // Clean up
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);
          
          resolve(true);
        } catch (error) {
          console.error('Export error:', error);
          alert(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
          resolve(false);
        } finally {
          mediaRecorder.stream.getTracks().forEach(track => track.stop());
          setIsExporting(false);
        }
      });
    } catch (error) {
      console.error('Error during export:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
      setIsExporting(false);
      return false;
    }
  }, [setIsExporting]);

  return (
    <div className="relative min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="relative">
        <IPhoneMockup ref={svgRef}>
          <video
            ref={videoRef}
            src={currentVideoSrc}
            className="w-full h-full object-contain"
            playsInline
            muted
            loop
          />
        </IPhoneMockup>
      </div>
      
      <div className="flex gap-4 mt-4">
        <button 
          onClick={testCapture}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Test Capture
        </button>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
        >
          {isExporting ? 'Exporting...' : 'Export Video with Frame'}
        </button>
      </div>
      
      <ControlBar 
        isVisible={isControlBarVisible}
        onClose={handleCloseControlBar}
        onVideoSelect={handleVideoSelect}
      />
    </div>
  );
}

export default App;
