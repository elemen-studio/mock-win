import React, { useRef } from 'react'
import { Video, X, Command } from 'lucide-react'

interface ControlBarProps {
  isVisible: boolean
  onClose: () => void
  onVideoSelect: (videoSrc: string) => void
}

export function ControlBar({ isVisible, onClose, onVideoSelect }: ControlBarProps) {
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

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Control Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom duration-200">
        <div className="bg-white/98 backdrop-blur-lg rounded-xl shadow-lg border border-gray-200/60 px-4 py-3 font-jetbrains">
          <div className="flex items-center gap-4">
            {/* Select Video Button */}
            <button
              onClick={handleFileSelect}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-md transition-colors duration-150 text-sm font-jetbrains"
            >
              <Video size={16} strokeWidth={2} />
              <span>select_video</span>
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-300/60" />

            {/* Keyboard Shortcuts Info */}
            <div className="flex items-center gap-3 text-xs font-jetbrains" style={{ color: 'black' }}>
              <div className="flex items-center gap-1.5">
                <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 rounded text-[10px] border border-gray-200 w-auto" style={{ color: 'black' }}>
                  <Command size={10} />
                  <span>+</span>
                  <span>K</span>
                </kbd>
                <span>toggle</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] border border-gray-200 w-auto" style={{ color: 'black' }}>ESC</kbd>
                <span>close</span>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-300/60" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 hover:bg-gray-100 rounded-md transition-all duration-150"
              style={{ color: 'black' }}
              title="close"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
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
    </>
  )
} 