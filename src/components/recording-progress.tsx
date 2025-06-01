interface RecordingProgressProps {
    progress: number; // 0 to 100
    isRecording: boolean;
  }
  
  export function RecordingProgress({ progress, isRecording }: RecordingProgressProps) {
    if (!isRecording) return null;
  
    // Round the progress to ensure text and bar are in sync
    const roundedProgress = Math.round(progress);
  
    return (
      <div className="fixed inset-0 z-50 bg-white bg-opacity-50 flex items-center justify-center">
        <div className="p-8 min-w-96 max-w-md mx-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            <div className="text-center">
              <div className="text-lg font-jetbrains text-custom-3 mb-4">
                Recording in progress...
              </div>
              <div className="text-2xl font-jetbrains text-custom-3 mb-4">
                {roundedProgress}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-custom-3 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${roundedProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }