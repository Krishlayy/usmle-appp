'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Image as ImageIcon, Video } from 'lucide-react';

export type MediaType = 'IMAGE' | 'VIDEO';
export type MediaPlacement = 'TOP' | 'BOTTOM';
export type DisplaySize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'FULL';

export interface QuestionMediaItem {
  id: string; // temporary for new items
  type: MediaType;
  url: string;
  caption: string;
  placement: MediaPlacement;
  displaySize: DisplaySize;
  order: number;
}

interface ExplanationMediaProps {
  media: QuestionMediaItem[];
  onChange: (newMedia: QuestionMediaItem[]) => void;
}

function SortableMediaItem({
  item,
  updateItem,
  removeItem,
  onPreview,
}: {
  item: QuestionMediaItem;
  updateItem: (id: string, updates: Partial<QuestionMediaItem>) => void;
  removeItem: (id: string) => void;
  onPreview?: (url: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col sm:flex-row gap-4 bg-white border border-slate-200 rounded-lg p-4 shadow-sm group"
    >
      {/* Drag Handle */}
      <div
        className="flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Preview Thumbnail */}
      <div 
        className={`w-full sm:w-32 h-24 bg-slate-100 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center relative border border-slate-200 ${item.type === 'IMAGE' ? 'cursor-zoom-in' : ''}`}
        onClick={() => { if (item.type === 'IMAGE' && onPreview) onPreview(item.url); }}
      >
        {item.type === 'IMAGE' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center text-slate-400">
            <Video className="w-8 h-8 mb-1" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Video</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={item.caption || ''}
              onChange={(e) => updateItem(item.id, { caption: e.target.value })}
              placeholder="Optional caption..."
              className="w-full text-sm border-0 border-b border-transparent focus:border-blue-500 focus:ring-0 px-0 bg-transparent"
            />
          </div>
          <button
            onClick={() => removeItem(item.id)}
            className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
            title="Delete media"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mt-auto">
          {/* Placement Toggle */}
          <div className="flex items-center bg-slate-100 rounded p-1">
            <button
              onClick={() => updateItem(item.id, { placement: 'TOP' })}
              className={`px-2 py-1 text-xs rounded font-medium ${
                item.placement === 'TOP' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Top
            </button>
            <button
              onClick={() => updateItem(item.id, { placement: 'BOTTOM' })}
              className={`px-2 py-1 text-xs rounded font-medium ${
                item.placement === 'BOTTOM' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Bottom
            </button>
          </div>

          {/* Size Selector */}
          <select
            value={item.displaySize}
            onChange={(e) => updateItem(item.id, { displaySize: e.target.value as DisplaySize })}
            className="text-xs border-slate-200 rounded py-1 pl-2 pr-6 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
          >
            <option value="SMALL">Small (33%)</option>
            <option value="MEDIUM">Medium (60%)</option>
            <option value="LARGE">Large (85%)</option>
            <option value="FULL">Full Width (100%)</option>
          </select>
          
          <div className="text-xs text-slate-400 flex items-center ml-auto truncate max-w-[150px]" title={item.url}>
            {item.url}
          </div>
        </div>
      </div>
    </div>
  );
}

import { ExhibitDisplay } from '@/components/ExhibitDisplay';
import { Button } from '@/components/ui/Button';

export default function ExplanationMedia({ media, onChange }: ExplanationMediaProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const topMedia = media.filter((m) => m.placement === 'TOP').sort((a, b) => a.order - b.order);
  const bottomMedia = media.filter((m) => m.placement === 'BOTTOM').sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent, placement: MediaPlacement) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const items = placement === 'TOP' ? topMedia : bottomMedia;
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);

      const reorderedItems = arrayMove(items, oldIndex, newIndex);
      
      // Update the orders based on new index
      const updatedList = reorderedItems.map((item, idx) => ({ ...item, order: idx }));

      // Merge back into main media array immutably
      const otherMedia = media.filter((m) => m.placement !== placement);
      onChange([...otherMedia, ...updatedList]);
    }
  };

  const addItem = (item: Omit<QuestionMediaItem, 'id' | 'order'>) => {
    const placementList = item.placement === 'TOP' ? topMedia : bottomMedia;
    const newItem: QuestionMediaItem = {
      ...item,
      id: crypto.randomUUID(),
      order: placementList.length,
    };
    onChange([...media, newItem]);
  };

  const updateItem = (id: string, updates: Partial<QuestionMediaItem>) => {
    const updatedMedia = media.map((item) => {
      if (item.id === id) {
        // If placement changed, we need to assign a new order at the end of the new placement list
        if (updates.placement && updates.placement !== item.placement) {
          const targetList = updates.placement === 'TOP' ? topMedia : bottomMedia;
          return { ...item, ...updates, order: targetList.length };
        }
        return { ...item, ...updates };
      }
      return item;
    });
    
    // If placement changed, we should re-normalize orders for both lists
    if (updates.placement) {
      const newTop = updatedMedia.filter(m => m.placement === 'TOP').sort((a,b) => a.order - b.order).map((m, i) => ({...m, order: i}));
      const newBottom = updatedMedia.filter(m => m.placement === 'BOTTOM').sort((a,b) => a.order - b.order).map((m, i) => ({...m, order: i}));
      onChange([...newTop, ...newBottom]);
    } else {
      onChange(updatedMedia);
    }
  };

  const removeItem = (id: string) => {
    onChange(media.filter((item) => item.id !== id));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    if (fileInputRef.current) fileInputRef.current.value = '';

    const newItems: QuestionMediaItem[] = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('Failed to upload image');
        const { publicUrl } = await res.json();

        newItems.push({
          id: crypto.randomUUID(),
          type: 'IMAGE',
          url: publicUrl,
          caption: '',
          placement: 'BOTTOM',
          displaySize: 'MEDIUM',
          order: 0, // will be normalized later
        });
      } catch (err) {
        console.error(err);
        alert(`Error uploading image: ${file.name}`);
      }
    }
    
    setIsUploading(false);
    
    if (newItems.length > 0) {
      // Append and normalize order
      const combinedBottom = [...bottomMedia, ...newItems].map((m, i) => ({ ...m, order: i }));
      onChange([...topMedia, ...combinedBottom]);
    }
  };

  const handleAddVideo = () => {
    const url = prompt('Enter YouTube, Vimeo, or direct MP4 URL:');
    if (url) {
      addItem({
        type: 'VIDEO',
        url,
        caption: '',
        placement: 'BOTTOM',
        displaySize: 'MEDIUM',
      });
    }
  };

  const renderSortableList = (items: QuestionMediaItem[], placement: MediaPlacement, title: string) => (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
      <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
        {title}
        <span className="text-xs font-normal text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </h4>
      
      {items.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
          No items in this group.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(e) => handleDragEnd(e, placement)}
        >
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <SortableMediaItem
                  key={item.id}
                  item={item}
                  updateItem={updateItem}
                  removeItem={removeItem}
                  onPreview={setPreviewImage}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );

  return (
    <div className="mt-8 border-t-2 border-slate-100 pt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Explanation Media</h3>
          <p className="text-sm text-slate-500">Add images and videos separately from the text explanation.</p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            isLoading={isUploading}
            variant="secondary"
            className="flex items-center gap-2"
          >
            {!isUploading && <ImageIcon className="w-4 h-4" />}
            Add Image
          </Button>
          <button
            type="button"
            onClick={handleAddVideo}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors"
          >
            <Video className="w-4 h-4" />
            Add Video
          </button>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        multiple
        className="hidden"
      />

      {renderSortableList(topMedia, 'TOP', 'Top Media (Renders above text)')}
      {renderSortableList(bottomMedia, 'BOTTOM', 'Bottom Media (Renders below text)')}

      {previewImage && (
        <ExhibitDisplay 
          mediaUrl={previewImage} 
          onClose={() => setPreviewImage(null)} 
        />
      )}
    </div>
  );
}
