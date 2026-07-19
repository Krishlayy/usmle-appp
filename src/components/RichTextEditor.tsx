'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, Italic, Underline as UnderlineIcon, Subscript as SubscriptIcon, Superscript as SuperscriptIcon, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Table as TableIcon, ImageIcon, Trash2, Rows, Columns, Move
} from 'lucide-react';
import { ExhibitDisplay } from './ExhibitDisplay';

const ResizableImageNode = (props: any) => {
  const { node, updateAttributes, selected } = props;
  const imageRef = useRef<HTMLImageElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [width, setWidth] = useState(node.attrs.width || '100%');

  useEffect(() => {
    setWidth(node.attrs.width || '100%');
  }, [node.attrs.width]);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = imageRef.current?.getBoundingClientRect().width || 0;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const currentX = moveEvent.clientX;
      const diff = currentX - startX;
      const newWidth = Math.max(50, startWidth + diff); // min width 50px
      setWidth(`${newWidth}px`);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      if (imageRef.current) {
        updateAttributes({ width: `${imageRef.current.getBoundingClientRect().width}px` });
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const align = node.attrs.align || 'center';
  let alignClass = 'block mx-auto';
  if (align === 'left') alignClass = 'float-left mr-4 mb-2';
  else if (align === 'right') alignClass = 'float-right ml-4 mb-2';

  return (
    <NodeViewWrapper className={`relative max-w-full m-1 ${alignClass} ${selected ? 'ring-2 ring-blue-500 rounded-sm' : ''}`}>
      {/* Top-Left Drag Handle for Repositioning */}
      {selected && (
        <div
          contentEditable={false}
          data-drag-handle
          draggable={true}
          className="absolute top-0 left-0 w-6 h-6 bg-slate-800 text-white flex items-center justify-center rounded-br-md cursor-grab active:cursor-grabbing shadow-sm z-10"
          title="Drag to reposition"
        >
          <Move className="w-3.5 h-3.5" />
        </div>
      )}

      <img
        ref={imageRef}
        src={node.attrs.src}
        alt={node.attrs.alt}
        style={{ width: isResizing ? width : node.attrs.width }}
        className="max-w-full h-auto rounded-sm cursor-zoom-in"
        draggable={false}
        onClick={(e) => {
          if (!isResizing) {
            // Dispatch custom event to tell parent editor to open ExhibitDisplay
            document.dispatchEvent(new CustomEvent('open-exhibit', { detail: node.attrs.src }));
          }
        }}
      />
      
      {/* Bottom-Right Resize Handle */}
      {selected && (
        <div
          onMouseDown={startResize}
          onDragStart={(e) => e.preventDefault()}
          draggable={false}
          className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-se-resize transform translate-x-1/2 translate-y-1/2 hover:scale-125 transition-transform shadow-sm z-10"
          title="Drag to resize"
        />
      )}
    </NodeViewWrapper>
  );
};

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { style: `width: ${attributes.width}` };
        },
      },
      align: {
        default: 'center',
        renderHTML: (attributes) => {
          if (!attributes.align) return {};
          return { 'data-align': attributes.align };
        },
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNode);
  },
});

export default function RichTextEditor({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void; 
}) {
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  useEffect(() => {
    const handleOpenExhibit = (e: Event) => {
      const customEvent = e as CustomEvent;
      setZoomImage(customEvent.detail);
    };
    document.addEventListener('open-exhibit', handleOpenExhibit);
    return () => {
      document.removeEventListener('open-exhibit', handleOpenExhibit);
    };
  }, []);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Subscript,
      Superscript,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CustomImage.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'draggable-image',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to upload image');
      const { publicUrl } = await res.json();

      editor.chain().focus().setImage({ src: publicUrl }).run();
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Image upload failed. Please try again.');
    }
    
    e.target.value = '';
  };

  return (
    <div className="relative border border-slate-300 rounded-md shadow-sm overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
      
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-300 bg-slate-50 p-2">
        {/* TEXT FORMATTING */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
          className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${editor.isActive('bold') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
          title="Bold"
        ><Bold className="w-4 h-4" /></button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
          className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${editor.isActive('italic') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
          title="Italic"
        ><Italic className="w-4 h-4" /></button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
          className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${editor.isActive('underline') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
          title="Underline"
        ><UnderlineIcon className="w-4 h-4" /></button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleSubscript().run(); }}
          className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${editor.isActive('subscript') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
          title="Subscript"
        ><SubscriptIcon className="w-4 h-4" /></button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleSuperscript().run(); }}
          className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${editor.isActive('superscript') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
          title="Superscript"
        ><SuperscriptIcon className="w-4 h-4" /></button>

        <div className="w-px h-6 bg-slate-300 mx-1"></div>

        {/* ALIGNMENT */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('left').run(); }}
          className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
          title="Align Left"
        ><AlignLeft className="w-4 h-4" /></button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('center').run(); }}
          className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
          title="Align Center"
        ><AlignCenter className="w-4 h-4" /></button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('right').run(); }}
          className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
          title="Align Right"
        ><AlignRight className="w-4 h-4" /></button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('justify').run(); }}
          className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${editor.isActive({ textAlign: 'justify' }) ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
          title="Justify"
        ><AlignJustify className="w-4 h-4" /></button>

        <div className="w-px h-6 bg-slate-300 mx-1"></div>

        {/* LISTS */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
          className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${editor.isActive('bulletList') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
          title="Bullet List"
        ><List className="w-4 h-4" /></button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
          className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${editor.isActive('orderedList') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
          title="Ordered List"
        ><ListOrdered className="w-4 h-4" /></button>

        <div className="w-px h-6 bg-slate-300 mx-1"></div>

        {/* MEDIA */}
        <label className="p-1.5 rounded hover:bg-slate-200 transition-colors text-slate-700 cursor-pointer" title="Upload Inline Image">
          <ImageIcon className="w-4 h-4" />
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleImageUpload}
          />
        </label>
      </div>

      {/* TABLE CONTROLS - ONLY SHOW IF TABLE IS ACTIVE OR TO CREATE TABLE */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-300 bg-slate-100/50 p-2 text-xs">
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); }}
          className="flex items-center gap-1 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
          title="Insert 3x3 Table"
        ><TableIcon className="w-3.5 h-3.5" /> Add Table</button>
        
        {editor.isActive('table') && (
          <>
            <div className="w-px h-4 bg-slate-300 mx-1"></div>
            
            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addRowBefore().run(); }} className="px-2 py-1 rounded hover:bg-slate-200 text-slate-700 flex items-center gap-1"><Rows className="w-3.5 h-3.5"/> +Row Before</button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addRowAfter().run(); }} className="px-2 py-1 rounded hover:bg-slate-200 text-slate-700 flex items-center gap-1"><Rows className="w-3.5 h-3.5"/> +Row After</button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteRow().run(); }} className="px-2 py-1 rounded hover:bg-red-100 text-red-600 flex items-center gap-1"><Trash2 className="w-3.5 h-3.5"/> -Row</button>
            
            <div className="w-px h-4 bg-slate-300 mx-1"></div>
            
            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addColumnBefore().run(); }} className="px-2 py-1 rounded hover:bg-slate-200 text-slate-700 flex items-center gap-1"><Columns className="w-3.5 h-3.5"/> +Col Before</button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addColumnAfter().run(); }} className="px-2 py-1 rounded hover:bg-slate-200 text-slate-700 flex items-center gap-1"><Columns className="w-3.5 h-3.5"/> +Col After</button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteColumn().run(); }} className="px-2 py-1 rounded hover:bg-red-100 text-red-600 flex items-center gap-1"><Trash2 className="w-3.5 h-3.5"/> -Col</button>
            
            <div className="w-px h-4 bg-slate-300 mx-1"></div>
            
            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().mergeCells().run(); }} className="px-2 py-1 rounded hover:bg-slate-200 text-slate-700">Merge Cells</button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().splitCell().run(); }} className="px-2 py-1 rounded hover:bg-slate-200 text-slate-700">Split Cell</button>
            
            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteTable().run(); }} className="px-2 py-1 rounded hover:bg-red-100 text-red-600 font-bold ml-auto">Delete Table</button>
          </>
        )}
      </div>

      {/* IMAGE CONTROLS */}
      {editor.isActive('image') && (
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-300 bg-slate-100/50 p-2 text-xs">
          <span className="font-semibold text-slate-600 mr-2 flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> Image:</span>
          
          {/* ALIGNMENT */}
          <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().updateAttributes('image', { align: 'left' }).run(); }} className={`px-2 py-1 rounded hover:bg-slate-200 ${editor.isActive('image', { align: 'left' }) ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}>Left</button>
          <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().updateAttributes('image', { align: 'center' }).run(); }} className={`px-2 py-1 rounded hover:bg-slate-200 ${editor.isActive('image', { align: 'center' }) ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}>Center</button>
          <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().updateAttributes('image', { align: 'right' }).run(); }} className={`px-2 py-1 rounded hover:bg-slate-200 ${editor.isActive('image', { align: 'right' }) ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}>Right</button>

          <div className="w-px h-4 bg-slate-300 mx-1"></div>

          {/* RESIZE */}
          <span className="font-semibold text-slate-600 mr-1">Width:</span>
          <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().updateAttributes('image', { width: '25%' }).run(); }} className="px-2 py-1 rounded hover:bg-slate-200 text-slate-700">25%</button>
          <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().updateAttributes('image', { width: '50%' }).run(); }} className="px-2 py-1 rounded hover:bg-slate-200 text-slate-700">50%</button>
          <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().updateAttributes('image', { width: '75%' }).run(); }} className="px-2 py-1 rounded hover:bg-slate-200 text-slate-700">75%</button>
          <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().updateAttributes('image', { width: '100%' }).run(); }} className="px-2 py-1 rounded hover:bg-slate-200 text-slate-700 font-semibold">100%</button>
        </div>
      )}

      <div className="prose-wrapper [&_table]:w-full [&_table]:border-collapse [&_th]:border-2 [&_th]:border-slate-400 [&_th]:p-2 [&_th]:bg-slate-100 [&_td]:border-2 [&_td]:border-slate-400 [&_td]:p-2 [&_td]:min-w-[50px] [&_td]:min-h-[25px] [&_img]:inline-block" onClick={() => editor?.commands.focus()}>
        <EditorContent editor={editor} />
      </div>

      {zoomImage && (
        <ExhibitDisplay 
          mediaUrl={zoomImage} 
          onClose={() => setZoomImage(null)} 
        />
      )}
    </div>
  );
}
