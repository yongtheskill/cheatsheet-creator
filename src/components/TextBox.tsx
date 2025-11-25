import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Rnd } from 'react-rnd';
import { MarkdownRenderer } from './MarkdownRenderer';
import { clsx } from 'clsx';
import { Minus, Plus, Trash2 } from 'lucide-react';

export interface TextBoxData {
  id: string;
  pageId: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
}

interface TextBoxProps {
  data: TextBoxData;
  isSelected: boolean;
  onUpdate: (id: string, updates: Partial<TextBoxData>) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  imageMap?: Record<string, string>;
}

export const TextBox: React.FC<TextBoxProps> = ({
  data,
  isSelected,
  onUpdate,
  onSelect,
  onDelete,
  imageMap = {},
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [controlPosition, setControlPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  // Update control position when selected or moved
  useEffect(() => {
    if (isSelected && boxRef.current) {
      const updatePosition = () => {
        const rect = boxRef.current?.getBoundingClientRect();
        if (rect) {
          setControlPosition({
            top: rect.top + window.scrollY - 35, // Position above the box
            left: rect.right + window.scrollX - 100, // Align right
          });
        }
      };

      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isSelected, data.x, data.y, data.width, data.height]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    onSelect(data.id);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  return (
    <>
      <Rnd
        size={{ width: data.width, height: data.height }}
        position={{ x: data.x, y: data.y }}
        onDragStop={(_e, d) => {
          onUpdate(data.id, { x: d.x, y: d.y });
          onSelect(data.id);
        }}
        onResizeStop={(_e, _direction, ref, _delta, position) => {
          onUpdate(data.id, {
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
            ...position,
          });
          onSelect(data.id);
        }}
        bounds='parent'
        className={clsx('group', isSelected ? 'z-50' : 'z-10', !isEditing && 'cursor-move')}
        disableDragging={isEditing}
        enableResizing={!isEditing}>
        <div
          ref={boxRef}
          className={clsx(
            'w-full h-full relative',
            isSelected && !isEditing && 'ring-2 ring-indigo-500',
            'hover:ring-1 hover:ring-indigo-300 transition-shadow rounded-sm'
          )}
          onDoubleClick={handleDoubleClick}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(data.id);
          }}>
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={data.content}
              onChange={(e) => onUpdate(data.id, { content: e.target.value })}
              onBlur={handleBlur}
              className='w-full h-full p-2 resize-none outline-none border border-indigo-500 bg-white/95 font-mono text-sm shadow-lg rounded-sm'
              style={{ fontSize: `${data.fontSize}px` }}
            />
          ) : (
            <div className='w-full h-full overflow-hidden'>
              <MarkdownRenderer
                content={data.content}
                fontSize={data.fontSize}
                imageMap={imageMap}
              />
            </div>
          )}
        </div>
      </Rnd>

      {/* Controls Portal */}
      {isSelected &&
        !isEditing &&
        createPortal(
          <div
            className='fixed z-[9999] flex items-center gap-1 bg-white shadow-xl shadow-slate-200/50 border border-slate-100 rounded-lg p-1.5 print:hidden animate-in fade-in zoom-in-95 duration-200'
            style={{
              top: controlPosition.top,
              left: controlPosition.left,
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() =>
                onUpdate(data.id, { fontSize: Number(Math.max(1, data.fontSize - 0.1).toFixed(1)) })
              }
              className='p-1.5 hover:bg-slate-100 rounded-md text-slate-600 cursor-pointer transition-colors'
              title='Decrease Font Size'>
              <Minus size={14} />
            </button>

            <span className='text-xs font-medium w-8 text-center select-none text-slate-700 tabular-nums'>
              {data.fontSize}
            </span>

            <button
              onClick={() =>
                onUpdate(data.id, { fontSize: Number((data.fontSize + 0.1).toFixed(1)) })
              }
              className='p-1.5 hover:bg-slate-100 rounded-md text-slate-600 cursor-pointer transition-colors'
              title='Increase Font Size'>
              <Plus size={14} />
            </button>

            <div className='w-px h-4 bg-slate-200 mx-1' />

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(data.id);
              }}
              className='text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md p-1.5 transition-colors'
              title='Delete'>
              <Trash2 size={14} />
            </button>
          </div>,
          document.body
        )}
    </>
  );
};
