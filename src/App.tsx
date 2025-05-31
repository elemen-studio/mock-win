import { useState, useEffect } from "react";
import { IPhoneMockup } from "@/components/iphone-mockup";
import { Video } from "@/components/video";
import { ControlBar } from "@/components/control-bar";

function App() {
  const [currentVideoSrc, setCurrentVideoSrc] = useState("/ss.mp4");
  const [isControlBarVisible, setIsControlBarVisible] = useState(true);

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

  return (
    <div className="flex justify-center items-center min-h-screen px-4 py-4">
      <div className="w-full max-w-sm max-h-[90vh] flex justify-center items-center">
        <IPhoneMockup className="w-full h-auto max-h-full">
          <Video src={currentVideoSrc} />
        </IPhoneMockup>
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
