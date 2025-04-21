import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { common, createLowlight } from 'lowlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import CustomImage from './extensions/CustomImage';
import Placeholder from '@tiptap/extension-placeholder';
import ImageEditMenu from './ImageEditMenu';

import { Toolbar } from './Toolbar';
import './editor-styles.css';
import { Textarea } from '@/components/ui/textarea';

interface RichTextEditorProps {
  initialContent?: string;
  onChange: (htmlContent: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const lowlight = createLowlight(common);

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialContent = '<p>Nhập nội dung ở đây...</p>', onChange, disabled = false, placeholder = 'Nhập nội dung...' }) => {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState(initialContent);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    const editorInstance = editor;
    if (!editorInstance || editorInstance.isDestroyed || isUploading) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
        toast.error('Loại file không hợp lệ. Chỉ chấp nhận JPG, PNG, GIF.');
        return;
    }
    const maxSizeMB = 10;
    if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`Kích thước file quá lớn. Tối đa là ${maxSizeMB}MB.`);
        return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token'); 
      if (!token) {
        throw new Error('Authentication token not found.');
      }
      const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };

      const response = await fetch('/api/upload', { method: 'POST', headers: headers, body: formData });

      if (!response.ok) {
        let errorMsg = 'Upload failed';
        try { const errorData = await response.json(); errorMsg = errorData.error || `Upload failed with status: ${response.status}`; } 
        catch (e) { errorMsg = `Upload failed with status: ${response.status}`; }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      if (data.url && editorInstance && !editorInstance.isDestroyed) {
        editorInstance.chain().focus().setImage({ src: data.url }).run();
        toast.success('Ảnh đã được tải lên!');
      } else {
        throw new Error('Invalid response from server or editor not ready');
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || 'Tải ảnh lên thất bại.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) { fileInputRef.current.value = ''; }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      uploadFile(event.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3, 4] },
      }),
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: 'plaintext' }),
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      CustomImage.configure({
          allowBase64: true,
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Color.configure({ types: ['textStyle'] }),
      TextStyle,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Underline,
    ],
    content: initialContent,
    editable: !disabled,
    editorProps: {
      handlePaste: (view, event, slice) => {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files.length > 0) {
          const file = event.clipboardData.files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            uploadFile(file);
            return true;
          }
        }
        return false;
      },
      attributes: {
        class:
          'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl max-w-full focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      if (!isHtmlMode && !disabled) {
        const currentHtml = editor.getHTML();
        onChange(currentHtml);
      }
    },
  });

  const toggleHtmlMode = useCallback(() => {
    if (!editor || editor.isDestroyed) return;
    const currentlyHtml = !isHtmlMode;
    if (currentlyHtml) {
        const currentEditorHtml = editor.getHTML();
        setHtmlContent(currentEditorHtml);
        editor.setEditable(false);
    } else {
        editor.commands.setContent(htmlContent, false);
        editor.setEditable(!disabled);
    }
    setIsHtmlMode(currentlyHtml);
  }, [editor, isHtmlMode, disabled, htmlContent]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (initialContent && !isHtmlMode) {
      const currentEditorHtml = editor.getHTML();
      if (initialContent !== currentEditorHtml) {
        editor.commands.setContent(initialContent, false);
        setHtmlContent(initialContent);
      }
    }
    if (!isHtmlMode) {
       editor.setEditable(!disabled);
    } else {
       editor.setEditable(false);
    }
  }, [initialContent, editor, isHtmlMode, disabled]);

  const handleHtmlChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newHtml = event.target.value;
      setHtmlContent(newHtml);
      onChange(newHtml); 
  };

  if (!editor) {
    return null;
  }

  return (
    <div className={cn(
        "border border-input rounded-md",
        disabled && "bg-gray-100 dark:bg-gray-800 opacity-70"
        )}>
      <Toolbar 
        editor={editor} 
        isHtmlMode={isHtmlMode} 
        toggleHtmlMode={toggleHtmlMode}
        triggerFileInput={triggerFileInput}
        isUploading={isUploading}
      />
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
        accept="image/*" 
      />

      <EditorContent 
        editor={editor} 
        className={cn(
          "min-h-[300px] p-4", 
          'prose dark:prose-invert max-w-full focus:outline-none',
          isHtmlMode && 'hidden'
        )}
      />
      <Textarea
        value={htmlContent}
        onChange={handleHtmlChange}
        disabled={disabled}
        className={cn(
            "min-h-[300px] p-4 font-mono text-sm rounded-t-none border-0 focus:outline-none focus-visible:ring-0 w-full box-border",
            !isHtmlMode && 'hidden'
        )}
        placeholder="Edit HTML code..."
      />

      {!isHtmlMode && !disabled && editor && !editor.isDestroyed && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100, zIndex: 50 }}
          shouldShow={({ editor }) => editor.isActive('customImage')}
        >
          <ImageEditMenu editor={editor} />
        </BubbleMenu>
      )}
    </div>
  );
};

export default RichTextEditor; 