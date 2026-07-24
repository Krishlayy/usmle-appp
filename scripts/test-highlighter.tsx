import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  const ref = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState('This is a <b>test</b> of the <i>perfect</i> highlighter.');

  useEffect(() => {
    const handleMouseUp = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;
      
      if (ref.current && ref.current.contains(sel.anchorNode)) {
        ref.current.contentEditable = 'true';
        document.execCommand('styleWithCSS', false, 'true');
        
        const currentColor = document.queryCommandValue('backColor');
        const isHighlighted = currentColor !== 'rgba(0, 0, 0, 0)' && currentColor !== 'transparent' && currentColor !== '';
        
        if (isHighlighted) {
          document.execCommand('backColor', false, 'transparent'); // Or removeFormat
          // clean up background-color: transparent
        } else {
          document.execCommand('backColor', false, 'yellow');
        }
        
        ref.current.contentEditable = 'false';
        setHtml(ref.current.innerHTML);
      }
    };
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />;
}

// Just a test file, won't actually run in node.
