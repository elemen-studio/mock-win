import React, { useRef } from 'react'
import { Upload, Download, Video as VideoIcon } from 'lucide-react'
import type { RecordingProgress } from '@/hooks/use-recording'

interface FileControlsProps {
  onVideoSelect: (videoSrc: string) => void
  onExport?: () => Promise<void>
  recordingProgress?: RecordingProgress
}

export function FileControls({ onVideoSelect, onExport, recordingProgress }: FileControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const videoUrl = URL.createObjectURL(file)
      onVideoSelect(videoUrl)
    }
  }

  const handleExport = async () => {
    if (onExport && !recordingProgress?.isRecording) {
      try {
        await onExport()
      } catch (error) {
        console.error('Export failed:', error)
      }
    }
  }

  return (
    <div className="bg-white rounded-lg border border-stroke font-jetbrains">
      {/* Header */}
      <div className="p-4 border-b border-stroke">
        <h2 className="text-lg font-semibold text-accent font-inter">File Controls</h2>
      </div>

      {/* Controls */}
      <div className="p-4 space-y-2">
        <button 
          onClick={handleFileSelect}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-custom-2 hover:bg-hover-fill rounded-md transition-colors font-jetbrains"
          disabled={recordingProgress?.isRecording}
        >
          <Upload size={16} />
          <span>Upload from device</span>
        </button>
        
        <button 
          onClick={handleExport}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors font-jetbrains ${
            recordingProgress?.isRecording 
              ? 'bg-red-100 text-red-600 cursor-not-allowed' 
              : 'text-custom-2 hover:bg-hover-fill'
          }`}
          disabled={recordingProgress?.isRecording || !onExport}
        >
          {recordingProgress?.isRecording ? (
            <VideoIcon size={16} className="animate-pulse" />
          ) : (
            <Download size={16} />
          )}
          <span>{recordingProgress?.isRecording ? 'Recording...' : 'Export video'}</span>
        </button>
      </div>

      {/* Status Message */}
      {recordingProgress?.status && (
        <div className="px-4 pb-2">
          <div className="text-xs text-custom-3 font-jetbrains bg-hover-fill rounded px-2 py-1 text-center">
            {recordingProgress.status}
          </div>
        </div>
      )}

      {/* Keyboard Shortcut Hint */}
      <div className="px-4 pb-4">
        <div className="text-xs text-custom-3 font-jetbrains">
          Press <kbd className="bg-hover-fill px-1.5 py-0.5 rounded text-custom-2">⌘ K</kbd> to toggle controls
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
} 