import React, { useState, useEffect, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react';

interface ImageEditMenuProps {
  editor: Editor;
}

const parseWidth = (width: string | number | null | undefined): number | string => {
  if (typeof width === 'number') return width;
  if (typeof width === 'string') {
    if (width.endsWith('%')) return width;
    const parsed = parseInt(width, 10);
    return isNaN(parsed) ? '' : parsed;
  }
  return '';
};

const formatWidth = (width: number | string): string => {
  if (typeof width === 'number') return `${width}px`;
  return width;
};

export const ImageEditMenu: React.FC<ImageEditMenuProps> = ({ editor }) => {
  const [altText, setAltText] = useState('');
  const [width, setWidth] = useState<number | string>('');
  const [currentAlign, setCurrentAlign] = useState<'left' | 'center' | 'right' | 'none'>(() => {
    // Initialize align state directly from editor attributes
    return editor?.getAttributes('customImage').align || 'none';
  });

  // Effect to update state ONLY when the selected node changes
  useEffect(() => {
    const handleSelectionUpdate = () => {
      if (editor.isActive('customImage')) {
        const attrs = editor.getAttributes('customImage');
        setAltText(attrs.alt || '');
        setWidth(parseWidth(attrs.width));
        setCurrentAlign(attrs.align || 'none');
      }
    };

    // Initial check
    handleSelectionUpdate();

    // Listen to selection updates
    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor]); // Only depends on editor instance

  const updateAttribute = (key: string, value: any) => {
    if (editor.isActive('customImage')) {
      const options = { [key]: value };
      if (key === 'width') {
        options.width = value === null || value === '' ? null : formatWidth(value);
      } else if (key === 'align') {
        options.align = value;
      }

      console.log("Updating image attributes:", options);
      editor.chain().focus().updateAttributes('customImage', options).run();
    }
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value) || /^\d+%$/.test(value)) {
      const parsedValue = value.endsWith('%') ? value : (value === '' ? '' : parseInt(value, 10));
      setWidth(parsedValue);
      updateAttribute('width', parsedValue === '' ? null : parsedValue);
    }
  };

  const handleAlignChange = (align: 'left' | 'center' | 'right') => {
    const newAlign = currentAlign === align ? 'none' : align;
    setCurrentAlign(newAlign);
    updateAttribute('align', newAlign);
  };

  const deleteImage = () => {
    if (editor.isActive('customImage')) {
      editor.chain().focus().deleteSelection().run();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3 flex flex-col gap-3 z-50 min-w-[200px]">
      {/* Alt Text */}
      <div className="flex flex-col gap-1">
        <label htmlFor="img-alt" className="text-xs font-medium text-gray-600 dark:text-gray-400">Alt Text</label>
        <input
          id="img-alt"
          type="text"
          value={altText}
          onChange={(e) => {
            setAltText(e.target.value);
            updateAttribute('alt', e.target.value);
          }}
          placeholder="Image description"
          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Width */}
      <div className="flex flex-col gap-1">
        <label htmlFor="img-width" className="text-xs font-medium text-gray-600 dark:text-gray-400">Width (px or %)</label>
        <input
          id="img-width"
          type="text"
          value={width}
          onChange={handleWidthChange}
          placeholder="auto"
          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Alignment */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Align</label>
        <div className="flex gap-2">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              type="button"
              onClick={() => handleAlignChange(align)}
              className={`p-1.5 rounded ${currentAlign === align ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'} transition-colors`}
              title={`Align ${align}`}
            >
              {align === 'left' && <AlignLeft size={16} />}
              {align === 'center' && <AlignCenter size={16} />}
              {align === 'right' && <AlignRight size={16} />}
            </button>
          ))}
        </div>
      </div>

      {/* Delete Button */}
      <button
        type="button"
        onClick={deleteImage}
        className="mt-2 flex items-center justify-center gap-1 px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition-colors w-full"
        title="Delete image"
      >
        <Trash2 size={14} />
        Delete
      </button>
    </div>
  );
};

export default ImageEditMenu; 