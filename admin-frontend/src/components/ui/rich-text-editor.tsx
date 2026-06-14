"use client"

import * as React from "react"
import { useEditor, EditorContent, type Editor, Extension } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { Link } from "@tiptap/extension-link"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import { TextAlign } from "@tiptap/extension-text-align"
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Quote,
  Undo,
  Redo,
  ImageIcon,
  LinkIcon,
  Palette,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Custom Font Size Extension
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType
      unsetFontSize: () => ReturnType
    }
  }
}

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize: () => ({ chain }) => chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    }
  },
})

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null

  const addImage = () => {
    const url = window.prompt("URL of the image:")
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("URL:", previousUrl)
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/40 rounded-t-md sticky top-0 z-10">
      {/* Headings */}
      <Button
        variant="ghost" size="sm"
        className={editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        title="Heading 1"
      ><Heading1 className="h-4 w-4" /></Button>
      <Button
        variant="ghost" size="sm"
        className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
      ><Heading2 className="h-4 w-4" /></Button>
      <Button
        variant="ghost" size="sm"
        className={editor.isActive("heading", { level: 3 }) ? "bg-muted" : ""}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Heading 3"
      ><Heading3 className="h-4 w-4" /></Button>
      
      <div className="w-px h-6 bg-border mx-1" />
      
      {/* Font Size Select */}
      <Select 
        onValueChange={(val: string | null) => {
          if (!val) return;
          if (val === "default") editor.chain().focus().unsetFontSize().run()
          else editor.chain().focus().setFontSize(val).run()
        }}
      >
        <SelectTrigger className="w-[110px] h-8 text-xs border-transparent shadow-none bg-transparent hover:bg-muted font-medium">
          <SelectValue placeholder="Text Size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="12px">Small (12px)</SelectItem>
          <SelectItem value="default">Normal (16px)</SelectItem>
          <SelectItem value="20px">Large (20px)</SelectItem>
          <SelectItem value="24px">Huge (24px)</SelectItem>
        </SelectContent>
      </Select>
      
      <div className="w-px h-6 bg-border mx-1" />

      {/* Formatting */}
      <Button
        variant="ghost" size="sm"
        className={editor.isActive("bold") ? "bg-muted" : ""}
        onClick={() => editor.chain().focus().toggleBold().run()}
      ><Bold className="h-4 w-4" /></Button>
      <Button
        variant="ghost" size="sm"
        className={editor.isActive("italic") ? "bg-muted" : ""}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      ><Italic className="h-4 w-4" /></Button>
      <Button
        variant="ghost" size="sm"
        className={editor.isActive("strike") ? "bg-muted" : ""}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      ><Strikethrough className="h-4 w-4" /></Button>
      
      {/* Color Picker */}
      <div className="relative inline-flex items-center justify-center">
        <label className="cursor-pointer hover:bg-muted p-2 rounded-md transition-colors flex items-center justify-center" title="Text Color">
          <Palette className="h-4 w-4" />
          <input 
            type="color" 
            onInput={(e) => editor.chain().focus().setColor(e.currentTarget.value).run()} 
            value={editor.getAttributes('textStyle').color || '#000000'}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
          />
        </label>
      </div>

      <div className="w-px h-6 bg-border mx-1" />
      
      {/* Alignment */}
      <Button
        variant="ghost" size="sm"
        className={editor.isActive({ textAlign: 'left' }) ? "bg-muted" : ""}
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      ><AlignLeft className="h-4 w-4" /></Button>
      <Button
        variant="ghost" size="sm"
        className={editor.isActive({ textAlign: 'center' }) ? "bg-muted" : ""}
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      ><AlignCenter className="h-4 w-4" /></Button>
      <Button
        variant="ghost" size="sm"
        className={editor.isActive({ textAlign: 'right' }) ? "bg-muted" : ""}
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      ><AlignRight className="h-4 w-4" /></Button>
      <Button
        variant="ghost" size="sm"
        className={editor.isActive({ textAlign: 'justify' }) ? "bg-muted" : ""}
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
      ><AlignJustify className="h-4 w-4" /></Button>

      <div className="w-px h-6 bg-border mx-1" />
      
      {/* Lists & Quotes */}
      <Button
        variant="ghost" size="sm"
        className={editor.isActive("bulletList") ? "bg-muted" : ""}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      ><List className="h-4 w-4" /></Button>
      <Button
        variant="ghost" size="sm"
        className={editor.isActive("orderedList") ? "bg-muted" : ""}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      ><ListOrdered className="h-4 w-4" /></Button>
      <Button
        variant="ghost" size="sm"
        className={editor.isActive("blockquote") ? "bg-muted" : ""}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      ><Quote className="h-4 w-4" /></Button>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Media & Links */}
      <Button variant="ghost" size="sm" onClick={setLink} className={editor.isActive('link') ? 'bg-muted' : ''}>
        <LinkIcon className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={addImage}>
        <ImageIcon className="h-4 w-4" />
      </Button>

      <div className="flex-1" />

      {/* History */}
      <Button
        variant="ghost" size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      ><Undo className="h-4 w-4" /></Button>
      <Button
        variant="ghost" size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      ><Redo className="h-4 w-4" /></Button>
    </div>
  )
}

interface RichTextEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Image,
      TextStyle,
      Color,
      FontSize,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value || `<p>${placeholder || "Start typing..."}</p>`,
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none min-h-[400px] focus:outline-none p-4",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  return (
    <div className="border rounded-md shadow-sm bg-background focus-within:ring-1 focus-within:ring-ring flex flex-col">
      <MenuBar editor={editor} />
      <div className="overflow-y-auto max-h-[600px] bg-background rounded-b-md">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
