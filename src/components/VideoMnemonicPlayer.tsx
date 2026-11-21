'use client';

import React, { useState, useRef, useEffect } from 'react';
import { videoSrc } from '@/lib/videoUrl';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, RotateCw, Sparkles, ShieldAlert } from 'lucide-react';

interface VideoMnemonicPlayerProps {
  videoUrl: string;
  title?: string;
  userEmail?: string;
  className?: string;
}

export function VideoMnemonicPlayer({
  videoUrl,
  title = 'High-Yield Video Mnemonic',
  userEmail = 'Verified Candidate',
  className = '',
}: VideoMnemonicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!videoUrl || !videoUrl.trim()) return null;

  // Helper to detect if URL is YouTube or Vimeo
  const getEmbedUrl = (url: string): string | null => {
    try {
      const ytMatch = url.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
      );
      if (ytMatch && ytMatch[1]) {
        return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=0&rel=0&modestbranding=1`;
      }
      const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/i);
      if (vimeoMatch && vimeoMatch[1]) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}?title=0&byline=0&portrait=0`;
      }
    } catch {
      return null;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      void videoRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const changeSpeed = () => {
    if (!videoRef.current) return;
    const speeds = [1, 1.25, 1.5, 2];
    const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];
    videoRef.current.playbackRate = nextSpeed;
    setPlaybackSpeed(nextSpeed);
  };

  const skipSeconds = (sec: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + sec));
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const restartVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    void videoRef.current.play().catch(() => setIsPlaying(false));
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (!isScrubbing && videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (!duration && videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={`rounded-xl border border-teal-200/80 bg-gradient-to-br from-teal-50/50 via-white to-slate-50 overflow-hidden shadow-sm ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-teal-800 to-cyan-900 text-white select-none">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-100 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            Video Mnemonic
          </span>
        </div>
        <span className="text-xs text-teal-200 font-medium truncate max-w-[280px]">
          {title}
        </span>
      </div>

      {/* Video Content Container */}
      <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden select-none">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="relative w-full h-full group">
            <video
              ref={videoRef}
              src={videoSrc(videoUrl)}
              playsInline
              onError={() => setLoadFailed(true)}
              preload="metadata"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              className="w-full h-full object-contain cursor-pointer"
              onClick={togglePlay}
            />

            {/* Static Anti-Piracy Watermark: Pinned cleanly in top corner */}
            <div className="absolute top-3 right-3 pointer-events-none z-20">
              <div className="px-2 py-0.5 rounded bg-black/40 backdrop-blur-[1px] border border-white/10 text-[9px] font-mono tracking-wider text-white/40 flex items-center gap-1.5 shadow-sm">
                <ShieldAlert className="w-2.5 h-2.5 text-teal-400/50" />
                <span>USMLE • {userEmail}</span>
              </div>
            </div>

            {loadFailed && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900 px-6 text-center text-sm text-slate-300">
                This video could not be loaded. Please try again shortly.
              </div>
            )}

            {/* Play Overlay Button if paused */}
            {!isPlaying && !loadFailed && (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-teal-600/90 text-white flex items-center justify-center shadow-xl hover:bg-teal-500 hover:scale-105 transition-all backdrop-blur-sm z-30"
                aria-label="Play Video"
              >
                <Play className="w-7 h-7 ml-1 fill-white" />
              </button>
            )}

            {/* Custom Control Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 flex flex-col gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity z-30">
              
              {/* Scrubber progress bar */}
              <div className="w-full flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-300 w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  onMouseDown={() => setIsScrubbing(true)}
                  onMouseUp={() => setIsScrubbing(false)}
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-teal-400 hover:h-2 transition-all"
                  aria-label="Seek Video"
                />
                <span className="text-[11px] font-mono text-slate-400 w-10">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Controls row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="hover:text-teal-400 transition-colors p-1"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => skipSeconds(-5)}
                    className="hover:text-teal-400 transition-colors p-1 flex items-center"
                    title="Rewind 5 seconds"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="text-[9px] ml-0.5">5s</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => skipSeconds(5)}
                    className="hover:text-teal-400 transition-colors p-1 flex items-center"
                    title="Forward 5 seconds"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span className="text-[9px] ml-0.5">5s</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleMute}
                    className="hover:text-teal-400 transition-colors p-1"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={changeSpeed}
                    className="text-xs font-bold px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 transition-colors"
                    title="Playback Speed"
                  >
                    {playbackSpeed}x
                  </button>
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="hover:text-teal-400 transition-colors p-1"
                    aria-label="Fullscreen"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
        <span>💡 Visual mnemonic active: Replays key mechanisms & high-yield differentiators for this vignette.</span>
      </div>
    </div>
  );
}
