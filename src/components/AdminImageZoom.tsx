'use client';

import React, { useState, useEffect } from 'react';
import { ExhibitDisplay } from './ExhibitDisplay';

export function AdminImageZoom({ children }: { children: React.ReactNode }) {
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent | TouchEvent) => {
      let target = e.target as HTMLElement;
      
      if (!target) return;
      if (target.nodeType === 3) {
        target = target.parentElement as HTMLElement;
      }
      if (!target) return;

      let imgElement: HTMLImageElement | null = null;
      if (target.tagName && target.tagName.toLowerCase() === 'img') {
        imgElement = target as HTMLImageElement;
      } else if (typeof target.closest === 'function') {
        const closestImg = target.closest('img');
        if (closestImg) {
          imgElement = closestImg as HTMLImageElement;
        }
      }
      
      if (imgElement && imgElement.src) {
        // Ensure we are inside a .prose container (to avoid triggering on UI icons)
        if (imgElement.closest('.prose')) {
          e.preventDefault();
          e.stopPropagation();
          setZoomImage(imgElement.src);
        }
      }
    };

    document.addEventListener('click', handleGlobalClick, { capture: true });
    
    return () => {
      document.removeEventListener('click', handleGlobalClick, { capture: true });
    };
  }, []);

  return (
    <>
      {children}
      {zoomImage && (
        <ExhibitDisplay 
          mediaUrl={zoomImage} 
          onClose={() => setZoomImage(null)} 
          onAddToNotes={() => {}}
        />
      )}
    </>
  );
}
