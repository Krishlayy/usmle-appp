'use client';

import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Sparkles } from 'lucide-react';

interface VideoMnemonicPlayerProps {
  videoUrl: string;
  title?: string;
  className?: string;
}

export function VideoMnemonicPlayer({
  videoUrl,
  title = 'High-Yield Video Mnemonic',
  className = '',
}: VideoMnemonicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!videoUrl || !videoUrl.trim()) return null;

  // Helper to detect if URL is YouTube or Vimeo
  const getEmbedUrl = (url: string): string | null => {
    try {
      // YouTube
      const ytMatch = url.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
      );
      if (ytMatch && ytMatch[1]) {
        return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=0&rel=0&modestbranding=1`;
      }

      // Vimeo
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
      videoRef.current.play();
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

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const restartVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  return (
    <div className={`rounded-xl border border-teal-200/80 bg-gradient-to-br from-teal-50/50 via-white to-slate-50 overflow-hidden shadow-sm ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-teal-800 to-cyan-900 text-white">
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
        <span className="text-xs text-teal-200 font-medium truncate max-w-[240px]">
          {title}
        </span>
      </div>

      {/* Video Content */}
      <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
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
              src={videoUrl}
              playsInline
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              className="w-full h-full object-contain cursor-pointer"
              onClick={togglePlay}
            />

            {/* Play Overlay Button if paused */}
            {!isPlaying && (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-teal-600/90 text-white flex items-center justify-center shadow-xl hover:bg-teal-500 hover:scale-105 transition-all backdrop-blur-sm"
                aria-label="Play Video"
              >
                <Play className="w-7 h-7 ml-1 fill-white" />
              </button>
            )}

            {/* Custom Control Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 flex items-center justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity">
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
                  onClick={restartVideo}
                  className="hover:text-teal-400 transition-colors p-1"
                  title="Replay from start"
                >
                  <RotateCcw className="w-4 h-4" />
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
        )}
      </div>

      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
        <span>💡 Watch this mnemonic to retain the key diagnostic associations for this vignette.</span>
      </div>
    </div>
  );
}
