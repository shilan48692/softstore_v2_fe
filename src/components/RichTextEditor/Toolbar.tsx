import React, { useCallback, useState, useEffect } from 'react';
import { type Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline, Strikethrough, Code, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, 
  List, ListOrdered, ListTodo, Pilcrow, Quote, Minus, Link2, Image, Table, Columns, Rows, Trash2, 
  AlignCenter, AlignLeft, AlignRight, AlignJustify, Paintbrush, Palette, Undo, Redo, Loader2,
  ImagePlus,
  WrapText,
  Maximize
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { SketchPicker, ColorResult } from 'react-color';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  editor: Editor | null;
  isHtmlMode: boolean;
  toggleHtmlMode: () => void;
  triggerFileInput: () => void;
  isUploading: boolean;
}

// Helper function to parse width (handles null, number, string with px/%, returns number or string %)
const parseWidth = (widthAttr: string | number | null | undefined): string | number => {
  if (widthAttr === null || widthAttr === undefined) return '';
  if (typeof widthAttr === 'number') return widthAttr;
  if (typeof widthAttr === 'string') {
    if (widthAttr.endsWith('%')) return widthAttr; // Keep percentage as string
    const parsed = parseInt(widthAttr, 10);
    return isNaN(parsed) ? '' : parsed; // Return number if px or just number
  }
  return '';
};

// Helper function to format width before saving (ensures px for numbers)
const formatWidth = (width: string | number | null | undefined): string | null => {
  if (width === null || width === undefined || width === '') return null;
  if (typeof width === 'string' && width.endsWith('%')) return width; // Keep percentage
  const num = typeof width === 'string' ? parseInt(width, 10) : width;
  return isNaN(num) || num <= 0 ? null : `${num}px`; // Add px if it's a valid number
};

export const Toolbar: React.FC<ToolbarProps> = ({ editor, isHtmlMode, toggleHtmlMode, triggerFileInput, isUploading }) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isImageEditDialogOpen, setIsImageEditDialogOpen] = useState(false);
  const [imageAlt, setImageAlt] = useState('');
  const [imageWidth, setImageWidth] = useState<string | number>('');

  // Check if an image is currently selected
  const isImageSelected = editor?.isActive('customImage') ?? false;

  // Update image dialog state when selection changes or dialog opens
  useEffect(() => {
    if (isImageSelected && isImageEditDialogOpen) {
      const attrs = editor?.getAttributes('customImage');
      setImageAlt(attrs?.alt || '');
      setImageWidth(parseWidth(attrs?.width));
    } else if (!isImageEditDialogOpen) {
      // Reset when dialog closes
      setImageAlt('');
      setImageWidth('');
    }
  }, [isImageSelected, isImageEditDialogOpen, editor]);

  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setIsLinkDialogOpen(true);
  }, [editor]);

  const saveLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    setIsLinkDialogOpen(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setIsLinkDialogOpen(false);
    setLinkUrl('');
  }, [editor]);

  const setColor = useCallback((color: string) => {
      if (!editor) return;
      editor.chain().focus().setColor(color).run();
  }, [editor])

  const unsetColor = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetColor().run();
  }, [editor]);

  const setHighlight = useCallback((color: string) => {
      if (!editor) return;
      editor.chain().focus().setHighlight({ color }).run();
  }, [editor])

  const unsetHighlight = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetHighlight().run();
  }, [editor]);

  // --- Image Actions ---
  const updateImageAttribute = useCallback((key: string, value: any) => {
    if (!editor || !isImageSelected) return;
    let options: { [key: string]: any } = {};
    if (key === 'width') {
      options.width = formatWidth(value);
    } else {
      options[key] = value;
    }
    editor.chain().focus().updateAttributes('customImage', options).run();
  }, [editor, isImageSelected]);

  const handleImageAltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageAlt(e.target.value);
  };

  const handleImageWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty, numbers, or numbers followed by %
    if (value === '' || /^\d+$/.test(value) || /^\d+%$/.test(value)) {
        setImageWidth(value); // Update state directly
    }
  };

  // Save image attributes when dialog closes
  const saveImageAttributes = () => {
      updateImageAttribute('alt', imageAlt);
      updateImageAttribute('width', imageWidth);
      setIsImageEditDialogOpen(false);
  };

  const setImageAlignment = useCallback((align: 'left' | 'center' | 'right' | null) => {
    if (!editor || !isImageSelected) return;
    const currentAlign = editor.getAttributes('customImage').align;
    const newAlign = currentAlign === align ? null : align;
    updateImageAttribute('align', newAlign);
  }, [editor, isImageSelected, updateImageAttribute]);

  const deleteImage = useCallback(() => {
    if (!editor || !isImageSelected) return;
    editor.chain().focus().deleteSelection().run();
  }, [editor, isImageSelected]);

  // Disable image controls if editor doesn't exist, is in HTML mode, or no image is selected
  const imageControlsDisabled = !editor || isHtmlMode || !isImageSelected;

  // Get current image alignment for button state
  const currentImageAlign = editor?.getAttributes('customImage').align;

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-input bg-transparent rounded-t-md p-1 flex flex-wrap items-center gap-1">
      {/* Basic Formatting */}
      <Button
        type="button"
        variant={editor.isActive('bold') ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        aria-label="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive('italic') ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        aria-label="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive('underline') ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        aria-label="Underline"
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive('strike') ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        aria-label="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={isHtmlMode ? "secondary" : "ghost"}
        size="sm"
        onClick={toggleHtmlMode}
        aria-label="Toggle HTML View"
      >
        <Code className="h-4 w-4" />
      </Button>

      <div className="h-8 w-px bg-border mx-1"></div>

      {/* Headings Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-auto px-2">
               { editor.isActive('heading', { level: 1 }) ? <Heading1 className="h-4 w-4"/> : 
                 editor.isActive('heading', { level: 2 }) ? <Heading2 className="h-4 w-4"/> : 
                 editor.isActive('heading', { level: 3 }) ? <Heading3 className="h-4 w-4"/> : 
                 editor.isActive('heading', { level: 4 }) ? <Heading4 className="h-4 w-4"/> : 
                 editor.isActive('heading', { level: 5 }) ? <Heading5 className="h-4 w-4"/> : 
                 editor.isActive('heading', { level: 6 }) ? <Heading6 className="h-4 w-4"/> : 
                 <Pilcrow className="h-4 w-4" /> } 
                <span className="ml-1 text-xs">{ editor.isActive('paragraph') ? 'Paragraph' : 'Heading'}</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()} disabled={editor.isActive('paragraph')}>Paragraph</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} disabled={editor.isActive('heading', { level: 1 })}>Heading 1</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} disabled={editor.isActive('heading', { level: 2 })}>Heading 2</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} disabled={editor.isActive('heading', { level: 3 })}>Heading 3</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} disabled={editor.isActive('heading', { level: 4 })}>Heading 4</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()} disabled={editor.isActive('heading', { level: 5 })}>Heading 5</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()} disabled={editor.isActive('heading', { level: 6 })}>Heading 6</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>

    <div className="h-8 w-px bg-border mx-1"></div>

      {/* Lists */}
      <Button
        type="button"
        variant={editor.isActive('bulletList') ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        aria-label="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive('orderedList') ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        aria-label="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive('taskList') ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        aria-label="Task List"
      >
        <ListTodo className="h-4 w-4" />
      </Button>

      <div className="h-8 w-px bg-border mx-1"></div>

      {/* Blocks */}
      <Button
        type="button"
        variant={editor.isActive('codeBlock') ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        aria-label="Code Block"
      >
        <Code className="h-4 w-4" /> <span className="ml-1 text-xs">Block</span>
      </Button>
      <Button
        type="button"
        variant={editor.isActive('blockquote') ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        aria-label="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        aria-label="Horizontal Rule"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <div className="h-8 w-px bg-border mx-1"></div>

      {/* Link */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Set Link"
            onClick={openLinkDialog}
            data-active={editor.isActive('link') ? 'true' : undefined}
            className={cn(editor.isActive('link') && "bg-secondary text-secondary-foreground")}
          >
            <Link2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit link</DialogTitle>
            <DialogDescription>
              Enter the URL for the link. Leave empty to remove the link.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link-url" className="text-right">
                URL
              </Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="col-span-3"
                placeholder="https://example.com"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); saveLink(); } }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={removeLink}>Remove Link</Button>
            <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={saveLink}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Image Button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={triggerFileInput}
        disabled={isUploading || isHtmlMode} // Also disable if in HTML mode
        aria-label="Upload Image"
      >
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
      </Button>

      {/* --- NEW: Image Editing Controls --- */}
      {/* Separator for Image Controls */}
       <div className={cn("h-8 w-px bg-border mx-1", imageControlsDisabled && "opacity-50")} />

      {/* Image Alignment Buttons */}
      <Button
        type="button"
        variant={currentImageAlign === 'left' ? "secondary" : "ghost"}
        size="sm"
        onClick={() => setImageAlignment('left')}
        disabled={imageControlsDisabled}
        aria-label="Align Image Left"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={currentImageAlign === 'center' ? "secondary" : "ghost"}
        size="sm"
        onClick={() => setImageAlignment('center')}
        disabled={imageControlsDisabled}
        aria-label="Align Image Center"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={currentImageAlign === 'right' ? "secondary" : "ghost"}
        size="sm"
        onClick={() => setImageAlignment('right')}
        disabled={imageControlsDisabled}
        aria-label="Align Image Right"
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      {/* Edit Image Attributes Dialog Trigger */}
      <Dialog open={isImageEditDialogOpen} onOpenChange={setIsImageEditDialogOpen}>
          <DialogTrigger asChild>
              <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={imageControlsDisabled}
                  aria-label="Edit Image Attributes"
              >
                  <ImagePlus className="h-4 w-4" />
              </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                  <DialogTitle>Edit Image</DialogTitle>
                  <DialogDescription>
                      Update image alt text and width.
                  </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="image-alt" className="text-right">
                          <WrapText className="h-4 w-4 inline-block mr-1" /> Alt Text
                      </Label>
                      <Input
                          id="image-alt"
                          value={imageAlt}
                          onChange={handleImageAltChange}
                          className="col-span-3"
                          placeholder="Describe the image"
                      />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="image-width" className="text-right">
                           <Maximize className="h-4 w-4 inline-block mr-1" /> Width
                      </Label>
                      <Input
                          id="image-width"
                          value={imageWidth}
                          onChange={handleImageWidthChange}
                          className="col-span-3"
                          placeholder="e.g., 300 or 50%"
                      />
                  </div>
              </div>
              <DialogFooter>
                   <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                   </DialogClose>
                   {/* Use DialogClose on Save to close it after saving */}
                   <DialogClose asChild>
                       <Button type="button" onClick={saveImageAttributes}>Save Changes</Button>
                   </DialogClose>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* Delete Image Button */}
       <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={deleteImage}
        disabled={imageControlsDisabled}
        aria-label="Delete Image"
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
      {/* --- END: Image Editing Controls --- */}

      <div className="h-8 w-px bg-border mx-1"></div>

      {/* Table Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-auto px-2" disabled={!editor || !editor.can().insertTable({rows: 3, cols: 3, withHeaderRow: true})}>
                <Table className="h-4 w-4"/>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} >Insert Table</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => editor?.chain().focus().addColumnBefore().run()} disabled={!editor?.can().addColumnBefore()}>Add Column Before</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor?.chain().focus().addColumnAfter().run()} disabled={!editor?.can().addColumnAfter()}>Add Column After</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor?.chain().focus().deleteColumn().run()} disabled={!editor?.can().deleteColumn()}>Delete Column</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => editor?.chain().focus().addRowBefore().run()} disabled={!editor?.can().addRowBefore()}>Add Row Before</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor?.chain().focus().addRowAfter().run()} disabled={!editor?.can().addRowAfter()}>Add Row After</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor?.chain().focus().deleteRow().run()} disabled={!editor?.can().deleteRow()}>Delete Row</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => editor?.chain().focus().deleteTable().run()} disabled={!editor?.can().deleteTable()}>Delete Table</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => editor?.chain().focus().mergeCells().run()} disabled={!editor?.can().mergeCells()}>Merge Cells</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor?.chain().focus().splitCell().run()} disabled={!editor?.can().splitCell()}>Split Cell</DropdownMenuItem>
             <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => editor?.chain().focus().toggleHeaderColumn().run()} disabled={!editor?.can().toggleHeaderColumn()}>Toggle Header Column</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor?.chain().focus().toggleHeaderRow().run()} disabled={!editor?.can().toggleHeaderRow()}>Toggle Header Row</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor?.chain().focus().toggleHeaderCell().run()} disabled={!editor?.can().toggleHeaderCell()}>Toggle Header Cell</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="h-8 w-px bg-border mx-1"></div>

       {/* Text Align Dropdown */}
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-auto px-2">
               { editor?.isActive({ textAlign: 'left' }) ? <AlignLeft className="h-4 w-4"/> : 
                 editor?.isActive({ textAlign: 'center' }) ? <AlignCenter className="h-4 w-4"/> : 
                 editor?.isActive({ textAlign: 'right' }) ? <AlignRight className="h-4 w-4"/> : 
                 editor?.isActive({ textAlign: 'justify' }) ? <AlignJustify className="h-4 w-4"/> : 
                 <AlignLeft className="h-4 w-4" /> } 
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem onClick={() => editor?.chain().focus().setTextAlign('left').run()} disabled={editor?.isActive({ textAlign: 'left' })}><AlignLeft className="h-4 w-4 mr-2" />Left</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor?.chain().focus().setTextAlign('center').run()} disabled={editor?.isActive({ textAlign: 'center' })}><AlignCenter className="h-4 w-4 mr-2" />Center</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor?.chain().focus().setTextAlign('right').run()} disabled={editor?.isActive({ textAlign: 'right' })}><AlignRight className="h-4 w-4 mr-2" />Right</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor?.chain().focus().setTextAlign('justify').run()} disabled={editor?.isActive({ textAlign: 'justify' })}><AlignJustify className="h-4 w-4 mr-2" />Justify</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>

    <div className="h-8 w-px bg-border mx-1"></div>

       {/* Highlight & Color */}
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label="Highlight Color"
                    className={cn(editor?.isActive('highlight') && "bg-secondary text-secondary-foreground")}
                >
                    <Paintbrush className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none" align="start">
                 <SketchPicker
                    color={editor?.getAttributes('highlight').color || '#ffffff'}
                    onChangeComplete={(color: ColorResult) => setHighlight(color.hex)}
                 />
                 <Button
                    type="button"
                    onClick={unsetHighlight}
                    variant="ghost"
                    className="w-full justify-start p-2 text-sm"
                 >
                    Remove Highlight
                 </Button>
            </PopoverContent>
        </Popover>

        <Popover>
             <PopoverTrigger asChild>
                 <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label="Text Color"
                    className={cn(editor?.isActive('textStyle') && "bg-secondary text-secondary-foreground")}
                >
                    <Palette className="h-4 w-4" />
                 </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none" align="start">
                 <SketchPicker
                    color={editor?.getAttributes('textStyle').color || '#000000'}
                    onChangeComplete={(color: ColorResult) => setColor(color.hex)}
                 />
                 <Button
                    type="button"
                    onClick={unsetColor}
                    variant="ghost"
                    className="w-full justify-start p-2 text-sm"
                 >
                    Default Color
                 </Button>
            </PopoverContent>
         </Popover>

    <div className="h-8 w-px bg-border mx-1"></div>

      {/* History */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().undo().run()}
        disabled={!editor?.can().undo()}
        aria-label="Undo"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().redo().run()}
        disabled={!editor?.can().redo()}
        aria-label="Redo"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
}; 