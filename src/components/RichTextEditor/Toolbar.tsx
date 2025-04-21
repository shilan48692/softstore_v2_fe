import React, { useCallback, useState, Dispatch, SetStateAction } from 'react';
import { type Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline, Strikethrough, Code, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, 
  List, ListOrdered, ListTodo, Pilcrow, Quote, Minus, Link2, Image, Table, Columns, Rows, Trash2, 
  AlignCenter, AlignLeft, AlignRight, AlignJustify, Paintbrush, Palette, Undo, Redo, Loader2
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

export const Toolbar: React.FC<ToolbarProps> = ({ editor, isHtmlMode, toggleHtmlMode, triggerFileInput, isUploading }) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

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

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-input bg-transparent rounded-md p-1 flex flex-wrap items-center gap-1">
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
      {/* --- Bỏ comment nút Underline --- */}
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

      {/* Link & Image */}
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
       <Button 
        type="button" 
        variant="ghost" 
        size="sm" 
        onClick={triggerFileInput}
        disabled={isUploading || isHtmlMode}
        aria-label="Upload Image"
      >
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
      </Button>

      <div className="h-8 w-px bg-border mx-1"></div>

      {/* Table Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-auto px-2" disabled={!editor.can().insertTable({rows: 3, cols: 3, withHeaderRow: true})}>
                <Table className="h-4 w-4"/>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} >Insert Table</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => editor.chain().focus().addColumnBefore().run()} disabled={!editor.can().addColumnBefore()}>Add Column Before</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={!editor.can().addColumnAfter()}>Add Column After</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().deleteColumn().run()} disabled={!editor.can().deleteColumn()}>Delete Column</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => editor.chain().focus().addRowBefore().run()} disabled={!editor.can().addRowBefore()}>Add Row Before</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().addRowAfter().run()} disabled={!editor.can().addRowAfter()}>Add Row After</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().deleteRow().run()} disabled={!editor.can().deleteRow()}>Delete Row</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => editor.chain().focus().deleteTable().run()} disabled={!editor.can().deleteTable()}>Delete Table</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => editor.chain().focus().mergeCells().run()} disabled={!editor.can().mergeCells()}>Merge Cells</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().splitCell().run()} disabled={!editor.can().splitCell()}>Split Cell</DropdownMenuItem>
             <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeaderColumn().run()} disabled={!editor.can().toggleHeaderColumn()}>Toggle Header Column</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeaderRow().run()} disabled={!editor.can().toggleHeaderRow()}>Toggle Header Row</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeaderCell().run()} disabled={!editor.can().toggleHeaderCell()}>Toggle Header Cell</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="h-8 w-px bg-border mx-1"></div>

       {/* Text Align Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-auto px-2">
               { editor.isActive({ textAlign: 'left' }) ? <AlignLeft className="h-4 w-4"/> : 
                 editor.isActive({ textAlign: 'center' }) ? <AlignCenter className="h-4 w-4"/> : 
                 editor.isActive({ textAlign: 'right' }) ? <AlignRight className="h-4 w-4"/> : 
                 editor.isActive({ textAlign: 'justify' }) ? <AlignJustify className="h-4 w-4"/> : 
                 <AlignLeft className="h-4 w-4" /> } 
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('left').run()} disabled={editor.isActive({ textAlign: 'left' })}><AlignLeft className="h-4 w-4 mr-2" />Left</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('center').run()} disabled={editor.isActive({ textAlign: 'center' })}><AlignCenter className="h-4 w-4 mr-2" />Center</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('right').run()} disabled={editor.isActive({ textAlign: 'right' })}><AlignRight className="h-4 w-4 mr-2" />Right</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('justify').run()} disabled={editor.isActive({ textAlign: 'justify' })}><AlignJustify className="h-4 w-4 mr-2" />Justify</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>

    <div className="h-8 w-px bg-border mx-1"></div>

       {/* Highlight & Color (Simplified: using preset colors) */}
        <Popover>
            <PopoverTrigger asChild>
                <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    aria-label="Highlight Color"
                    className={cn(editor.isActive('highlight') && "bg-secondary text-secondary-foreground")}
                >
                    <Paintbrush className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none" align="start">
                 <SketchPicker 
                    color={editor.getAttributes('highlight').color || '#ffffff'}
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
                    className={cn(editor.isActive('textStyle') && "bg-secondary text-secondary-foreground")}
                >
                    <Palette className="h-4 w-4" />
                 </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none" align="start">
                 <SketchPicker 
                    color={editor.getAttributes('textStyle').color || '#000000'}
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
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        aria-label="Undo"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        aria-label="Redo"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
}; 