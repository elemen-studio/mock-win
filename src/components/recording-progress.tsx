interface RecordingProgressProps {
  progress: number; // 0 to 100
  isRecording: boolean;
}

export function RecordingProgress({ progress, isRecording }: RecordingProgressProps) {
  if (!isRecording) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-80">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Recording in progress... {Math.round(progress)}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gray-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
} 