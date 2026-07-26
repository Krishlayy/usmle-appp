import { useState, useEffect, useCallback, RefObject } from 'react';

export interface Highlight {
  id: string;
  questionId: string;
  section: string;
  text: string;
  startOffset: number;
  endOffset: number;
  color: string;
  note?: string | null;
}

interface UseHighlighterProps {
  questionId: string;
  containerRef: RefObject<HTMLElement>;
  initialHighlights?: Highlight[];
}

export function useHighlighter({ questionId, containerRef, initialHighlights = [] }: UseHighlighterProps) {
  const [highlights, setHighlights] = useState<Highlight[]>(initialHighlights);
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [currentSelection, setCurrentSelection] = useState<{ startOffset: number; endOffset: number; text: string; section: string } | null>(null);

  // Helper to get absolute text offset ignoring HTML tags
  const getTextOffset = (node: Node, offset: number, container: HTMLElement) => {
    let currentOffset = 0;
    let found = false;

    const walk = (currentNode: Node) => {
      if (found) return;
      if (currentNode === node) {
        currentOffset += offset;
        found = true;
        return;
      }
      if (currentNode.nodeType === Node.TEXT_NODE) {
        currentOffset += (currentNode.textContent || '').length;
      } else {
        currentNode.childNodes.forEach(walk);
      }
    };

    walk(container);
    return currentOffset;
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !containerRef.current) {
        setSelectionRect(null);
        setCurrentSelection(null);
        return;
      }

      // Check if selection is inside our container
      if (!containerRef.current.contains(selection.anchorNode)) return;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Calculate offsets
      const startOffset = getTextOffset(range.startContainer, range.startOffset, containerRef.current);
      const endOffset = getTextOffset(range.endContainer, range.endOffset, containerRef.current);
      
      // Determine section (vignette vs explanation vs option) based on closest data-section attribute
      let section = 'stem';
      let el = range.startContainer.parentElement;
      while (el && el !== containerRef.current) {
        if (el.getAttribute('data-section')) {
          section = el.getAttribute('data-section')!;
          break;
        }
        el = el.parentElement;
      }

      setSelectionRect(rect);
      setCurrentSelection({
        startOffset: Math.min(startOffset, endOffset),
        endOffset: Math.max(startOffset, endOffset),
        text: selection.toString(),
        section
      });
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [containerRef]);

  const addHighlight = async (color: string) => {
    if (!currentSelection) return;

    const newHighlight: Highlight = {
      id: Math.random().toString(36).substring(7),
      questionId,
      ...currentSelection,
      color,
    };

    // Optimistic update
    setHighlights(prev => [...prev, newHighlight]);
    setSelectionRect(null);
    setCurrentSelection(null);
    window.getSelection()?.removeAllRanges();

    // Call API to persist
    try {
      await fetch('/api/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHighlight)
      });
    } catch (e) {
      console.error('Failed to save highlight', e);
    }
  };

  return { highlights, selectionRect, currentSelection, addHighlight };
}
