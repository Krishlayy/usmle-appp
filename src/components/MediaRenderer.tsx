'use client';

import React from 'react';
import Image from 'next/image';

export function MediaRenderer({ media, setZoomImage }: { media: { id: string; type: string; url: string; caption?: string | null; displaySize?: string; placement?: string; [key: string]: unknown }, setZoomImage?: (url: string) => void }) {
  const widthClass = 
    media.displaySize === 'SMALL' ? 'w-full max-w-sm' :
    media.displaySize === 'MEDIUM' ? 'w-full max-w-2xl' :
    media.displaySize === 'LARGE' ? 'w-full max-w-4xl' : 'w-full';

  if (media.type === 'IMAGE') {
    return (
      <div className={`flex flex-col items-center ${widthClass}`}>
        <button 
          type="button"
          className="exhibit-trigger p-2 bg-slate-50 border border-slate-200 rounded-sm cursor-zoom-in hover:bg-slate-100 transition-colors w-full flex justify-center relative min-h-[200px] block"
          onClick={() => setZoomImage?.(media.url)}
          data-url={media.url}
          title={setZoomImage ? "Click to zoom" : undefined}
        >
          <Image 
            src={media.url} 
            alt={media.caption || 'Clinical figure'} 
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain" 
            unoptimized={media.url.startsWith('data:')}
          />
        </button>
        {media.caption && <p className="text-sm text-slate-500 mt-2 font-medium text-center">{media.caption}</p>}
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
            <source src={media.url} />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
      {media.caption && <p className="text-sm text-slate-500 mt-2 font-medium text-center">{media.caption}</p>}
    </div>
  );
}
