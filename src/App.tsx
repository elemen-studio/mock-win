import { useState, useEffect, useRef } from "react";
import { IPhoneMockup } from "@/components/iphone-mockup";
import { Video } from "@/components/video";
import { ColorPickerSidebar } from "@/components/color-picker-sidebar";
import { SocialsSection } from "@/components/socials-section";
import { FileControls } from "@/components/file-controls";
import { Logo } from "@/components/logo";
import { SmallScreenMessage } from "@/components/small-screen-message";
import { useScreenRecorder } from "@/hooks/use-recording";
import { RecordingProgress } from "./components/recording-progress";

function App() {
  const [currentVideoSrc, setCurrentVideoSrc] = useState("/ss.mp4");
  const [areSidebarsVisible, setAreSidebarsVisible] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");

  const appRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { exportRecording, recordingProgress } = useScreenRecorder({
    appContainerRef: appRef,
    videoRef: videoRef,
    setAreSidebarsVisible: setAreSidebarsVisible,
  });

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if (
        (event.target as HTMLElement)?.tagName === "INPUT" ||
        (event.target as HTMLElement)?.tagName === "TEXTAREA"
      ) {
        return;
      }

      // Cmd+K or Ctrl+K to toggle sidebars
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        event.stopPropagation();
        setAreSidebarsVisible((prev) => !prev);
        return;
      }

      // ESC to hide sidebars (only when visible)
      if (event.key === "Escape" && areSidebarsVisible) {
        event.preventDefault();
        event.stopPropagation();
        setAreSidebarsVisible(false);
        return;
      }
    };

    document.addEventListener("keydown", handleKeydown, true);

    return () => {
      document.removeEventListener("keydown", handleKeydown, true);
    };
  }, [areSidebarsVisible]);

  const handleVideoSelect = (videoSrc: string) => {
    setCurrentVideoSrc(videoSrc);
  };

  const handleColorSelect = (color: string) => {
    console.log(color);
    setBackgroundColor(color);
  };

  return (
    <>
      {/* Small Screen Message - Show on very small screens */}
      <div className="block sm:hidden">
        <SmallScreenMessage />
      </div>

      {/* Fixed Progress Bar Overlay */}
      <RecordingProgress
        progress={recordingProgress.progress}
        isRecording={recordingProgress.isRecording}
      />

      {/* Main App - Hide on very small screens */}
      <div
        ref={appRef}
        className="hidden sm:block h-screen px-10 py-10 overflow-hidden"
        style={{ background: backgroundColor }}
      >
        <div
          className={`h-full grid ${
            areSidebarsVisible
              ? "grid-cols-[300px_1fr_300px]"
              : "grid-cols-[1fr]"
          } gap-4 lg:gap-8 items-start justify-center`}
        >
          {/* Left Sidebar - Color Picker */}
          {areSidebarsVisible && (
            <div className="flex flex-col space-y-4">
              <div className="h-10">
                <Logo />
              </div>
              <div className="w-full lg:w-auto flex justify-center lg:justify-start">
                <ColorPickerSidebar
                  onColorSelect={handleColorSelect}
                  selectedColor={backgroundColor}
                />
              </div>
            </div>
          )}

          {/* Main Content Area - iPhone Mockup */}
          <div className="flex justify-center items-center">
            <div className="w-full max-w-sm max-h-[90vh]">
              <IPhoneMockup className="w-full h-auto max-h-full">
                <Video ref={videoRef} src={currentVideoSrc} />
              </IPhoneMockup>
            </div>
          </div>

          {/* Right Sidebar - File Controls */}
          {areSidebarsVisible && (
            <div className="flex flex-col items-end space-y-4">
              {/* Spacer to match logo height + gap */}
              <div className="h-14"></div>
              <div className="w-80">
                <FileControls
                  onVideoSelect={handleVideoSelect}
                  onExport={exportRecording}
                  recordingProgress={recordingProgress}
                />
              </div>
              <div className="w-80">
                <SocialsSection />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
