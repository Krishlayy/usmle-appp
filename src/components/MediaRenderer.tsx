'use client';

import { videoSrc } from '@/lib/videoUrl';
import React from 'react';
import Image from 'next/image';

export function MediaRenderer({ media, setZoomImage }: { media: { id: string; type: string; url: string; caption?: string | null; displaySize?: string; placement?: string; [key: string]: unknown }, setZoomImage?: (url: string) => void }) {
  const widthClass = 
    media.displaySize === 'SMALL' ? 'w-full max-w-sm' :
    media.displaySize === 'MEDIUM' ? 'w-full max-w-2xl' :
    media.displaySize === 'LARGE' ? 'w-full max-w-4xl' : 'w-full';

  if (media.type === 'IMAGE') {
    return (
      <div className="flex flex-col items-start w-full my-4">
        <button 
          type="button"
          className="exhibit-trigger flex items-center gap-4 p-3 bg-white border border-slate-200 shadow-sm rounded-lg cursor-zoom-in hover:bg-slate-50 hover:border-teal-500 hover:shadow-md transition-all group"
          onClick={() => setZoomImage?.(media.url)}
          data-url={media.url}
          title="Click to view Exhibit"
        >
          <div className="relative w-14 h-14 rounded overflow-hidden flex-shrink-0 border border-slate-200 bg-slate-100">
            <Image 
              src={media.url} 
              alt={media.caption || 'Exhibit thumbnail'} 
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300" 
              unoptimized={true}
            />
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="font-bold text-slate-800 text-sm group-hover:text-teal-700 transition-colors">
              View Exhibit
            </span>
            <span className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-[220px]">
              {media.caption || 'Click to expand clinical image'}
            </span>
          </div>
        </button>
      </div>
    );
  }

  // VIDEO
  let iframeSrc = '';
  try {
    const isYoutube = media.url.includes('youtube.com') || media.url.includes('youtu.be');
    const isVimeo = media.url.includes('vimeo.com');

    if (isYoutube) {
      const urlObj = new URL(media.url);
      const videoId = urlObj.searchParams.get('v') || media.url.split('/').pop();
      iframeSrc = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
    } else if (isVimeo) {
      iframeSrc = `https://player.vimeo.com/video/${media.url.split('/').pop()}`;
    }
  } catch {
    // ignore parse errors
  }

  return (
    <div className={`flex flex-col items-center ${widthClass}`}>
      <div className="aspect-video w-full rounded-md overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
        {iframeSrc ? (
          <iframe
            width="100%"
            height="100%"
            src={iframeSrc}
            title={media.caption || "Educational Video"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <video 
            width="100%" 
            height="100%" 
            controls
            className="w-full h-full object-contain"
          >
            <source src={videoSrc(media.url)} />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
      {media.caption && <p className="text-sm text-slate-500 mt-2 font-medium text-center">{media.caption}</p>}
    </div>
  );
}
