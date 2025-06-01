import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause } from 'lucide-react';

interface VideoScrubberProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function VideoScrubber({ videoRef }: VideoScrubberProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      if (!isDragging) {
        setCurrentTime(video.currentTime);
      }
    };

    const updateDuration = () => {
      setDuration(video.duration);
    };

    const updatePlayingState = () => {
      setIsPlaying(!video.paused);
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', updatePlayingState);
    video.addEventListener('pause', updatePlayingState);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('play', updatePlayingState);
      video.removeEventListener('pause', updatePlayingState);
    };
  }, [videoRef, isDragging]);

  // Handle global mouse events for dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const video = videoRef.current;
      const progressBar = progressBarRef.current;
      if (!video || !progressBar) return;

      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      const newTime = percentage * duration;
      
      video.currentTime = newTime;
      setCurrentTime(newTime);
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, duration, videoRef]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = progressBarRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;
    
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    handleProgressClick(e);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white rounded-lg border border-stroke font-jetbrains">
      {/* Header */}
      <div className="p-4 border-b border-stroke">
        <h2 className="text-lg font-semibold text-accent font-inter">Video Controls</h2>
      </div>

      {/* Controls */}
      <div className="p-6 space-y-6">
        {/* Play/Pause Button */}
        <div className="flex justify-center">
          <motion.button
            onClick={togglePlayPause}
            className="flex items-center justify-center w-12 h-12 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isPlaying ? (
                <motion.div
                  key="pause"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  transition={{ duration: 0.15 }}
                >
                  <Pause size={16} />
                </motion.div>
              ) : (
                <motion.div
                  key="play"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  transition={{ duration: 0.15 }}
                >
                  <Play size={16} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Progress Section */}
        <div className="space-y-3">
          {/* Progress Bar */}
          <motion.div
            ref={progressBarRef}
            className="relative h-2 rounded-full cursor-pointer select-none"
            style={{ backgroundColor: '#919191' }}
            onMouseDown={handleMouseDown}
            onClick={handleProgressClick}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            animate={{ height: isHovering || isDragging ? 8 : 6 }}
            transition={{ duration: 0.2 }}
          >
            {/* Progress Fill */}
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{ 
                width: `${progressPercentage}%`,
                backgroundColor: '#5f5f5f'
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>

          {/* Time Display */}
          <div className="text-right">
            <span className="text-sm font-mono text-accent font-medium font-jetbrains">
              {formatTime(currentTime)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}