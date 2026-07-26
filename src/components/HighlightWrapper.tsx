import React, { useRef, useLayoutEffect } from 'react';
import { Highlight } from '@/hooks/useHighlighter';

interface HighlightWrapperProps {
  html: string;
  highlights: Highlight[];
  className?: string;
  section: string;
}

export function HighlightWrapper({ html, highlights, className, section }: HighlightWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current || !highlights.length) return;

    // Reset innerHTML to original before applying highlights to prevent duplicates
    containerRef.current.innerHTML = html;

    const sectionHighlights = highlights.filter(h => h.section === section).sort((a, b) => b.startOffset - a.startOffset);

    // Apply highlights from bottom to top to avoid offset shifting!
    sectionHighlights.forEach(highlight => {
      let currentOffset = 0;
      let startNode: Node | null = null;
      let startNodeOffset = 0;
      let endNode: Node | null = null;
      let endNodeOffset = 0;

      const walk = (node: Node) => {
        if (endNode) return;
        
        if (node.nodeType === Node.TEXT_NODE) {
          const len = (node.textContent || '').length;
          
          if (!startNode && currentOffset + len >= highlight.startOffset) {
            startNode = node;
            startNodeOffset = highlight.startOffset - currentOffset;
          }
          
          if (startNode && currentOffset + len >= highlight.endOffset) {
            endNode = node;
            endNodeOffset = highlight.endOffset - currentOffset;
          }
          
          currentOffset += len;
        } else {
          for (let i = 0; i < node.childNodes.length; i++) {
            walk(node.childNodes[i]);
          }
        }
      };

      walk(containerRef.current!);

      if (startNode && endNode) {
        try {
          const range = document.createRange();
          range.setStart(startNode, startNodeOffset);
          range.setEnd(endNode, endNodeOffset);
          
          const mark = document.createElement('mark');
          mark.style.backgroundColor = getHighlightColor(highlight.color);
          mark.style.color = 'inherit';
          mark.className = 'cursor-pointer rounded-sm px-[1px] group relative transition-colors';
          mark.dataset.highlightId = highlight.id;
          
          // Note tooltip
          if (highlight.note) {
            mark.title = highlight.note;
            mark.style.borderBottom = '2px dashed rgba(0,0,0,0.3)';
          }

          range.surroundContents(mark);
        } catch (e) {
          console.warn('Failed to apply highlight:', e);
        }
      }
    });

  }, [html, highlights, section]);

  const getHighlightColor = (name: string) => {
    const colors: any = {
      yellow: '#fef08a',
      green: '#bbf7d0',
      blue: '#bfdbfe',
      red: '#fecaca',
      purple: '#e9d5ff',
    };
    return colors[name] || colors.yellow;
  };

  return (
    <div 
      ref={containerRef} 
      data-section={section}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
}
