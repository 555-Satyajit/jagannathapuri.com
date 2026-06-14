"use client"

import * as React from "react"
import { 
  Bold, Italic, Strikethrough, 
  List, ListOrdered, 
  Undo, Redo, Heading1, Heading2, Quote, RemoveFormatting,
  Link as LinkIcon, Image as ImageIcon, Palette, Unlink
} from "lucide-react"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import LinkExtension from '@tiptap/extension-link'
import ImageExtension from '@tiptap/extension-image'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { Extension } from '@tiptap/core'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const policyTypes = [
  { id: "privacy", label: "Privacy Policy" },
  { id: "terms", label: "Terms of Service" },
  { id: "refund", label: "Refund Policy" },
  { id: "shipping", label: "Shipping Policy" },
]

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] } },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
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
      setFontSize: (fontSize: string) => ({ chain }: any) => chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize: () => ({ chain }: any) => chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    }
  },
})

const ToolbarButton = ({ icon: Icon, active = false, onClick, disabled = false }: { icon: any, active?: boolean, onClick: () => void, disabled?: boolean }) => (
  <Button 
    variant={active ? "secondary" : "ghost"} 
    size="icon" 
    className={`h-8 w-8 ${active ? 'bg-secondary' : 'text-muted-foreground hover:text-foreground'}`}
    type="button"
    onClick={onClick}
    disabled={disabled}
  >
    <Icon className="h-4 w-4" />
  </Button>
)

const RichTextEditor = ({ initialContent }: { initialContent: string }) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      FontSize,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-md my-4',
        },
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'min-h-[400px] border-0 focus-visible:outline-none p-0 text-base bg-transparent [&_p]:mb-4 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_blockquote]:border-l-4 [&_blockquote]:border-muted-foreground [&_blockquote]:pl-4 [&_blockquote]:italic',
      },
    },
  })

  if (!editor) {
    return <div className="min-h-[400px] p-6 bg-background flex items-center justify-center text-muted-foreground">Loading editor...</div>
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const addImage = () => {
    const url = window.prompt('Image URL')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/10">
        <ToolbarButton 
          icon={Undo} 
          onClick={() => editor.chain().focus().undo().run()} 
          disabled={!editor.can().undo()} 
        />
        <ToolbarButton 
          icon={Redo} 
          onClick={() => editor.chain().focus().redo().run()} 
          disabled={!editor.can().redo()} 
        />
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        <ToolbarButton 
          icon={Heading1} 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
          active={editor.isActive('heading', { level: 1 })} 
        />
        <ToolbarButton 
          icon={Heading2} 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          active={editor.isActive('heading', { level: 2 })} 
        />
        
        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Font Size Select */}
        <Select 
          onValueChange={(value) => {
            if (value === "default") {
              ;(editor.chain().focus() as any).unsetFontSize().run()
            } else {
              ;(editor.chain().focus() as any).setFontSize(value).run()
            }
          }}
        >
          <SelectTrigger className="h-8 w-[100px] text-xs">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="12px">12px</SelectItem>
            <SelectItem value="14px">14px</SelectItem>
            <SelectItem value="16px">16px</SelectItem>
            <SelectItem value="18px">18px</SelectItem>
            <SelectItem value="24px">24px</SelectItem>
            <SelectItem value="32px">32px</SelectItem>
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton 
          icon={Bold} 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          active={editor.isActive('bold')} 
        />
        <ToolbarButton 
          icon={Italic} 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          active={editor.isActive('italic')} 
        />
        <ToolbarButton 
          icon={Strikethrough} 
          onClick={() => editor.chain().focus().toggleStrike().run()} 
          active={editor.isActive('strike')} 
        />
        
        {/* Color Picker */}
        <div className="relative flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted cursor-pointer group">
          <Palette className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
          <input
            type="color"
            onInput={(event: any) => editor.chain().focus().setColor(event.target.value).run()}
            value={editor.getAttributes('textStyle').color || '#000000'}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            title="Text Color"
          />
        </div>

        <ToolbarButton 
          icon={RemoveFormatting} 
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} 
        />
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        <ToolbarButton 
          icon={List} 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          active={editor.isActive('bulletList')} 
        />
        <ToolbarButton 
          icon={ListOrdered} 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          active={editor.isActive('orderedList')} 
        />
        <ToolbarButton 
          icon={Quote} 
          onClick={() => editor.chain().focus().toggleBlockquote().run()} 
          active={editor.isActive('blockquote')} 
        />

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton 
          icon={LinkIcon} 
          onClick={setLink} 
          active={editor.isActive('link')} 
        />
        <ToolbarButton 
          icon={Unlink} 
          onClick={() => editor.chain().focus().unsetLink().run()} 
          disabled={!editor.isActive('link')} 
        />
        <ToolbarButton 
          icon={ImageIcon} 
          onClick={addImage} 
        />
      </div>
      
      <div className="p-6 bg-background">
        <EditorContent editor={editor} />
      </div>
    </>
  )
}

export function PoliciesContent() {
  const [isSaving, setIsSaving] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("privacy")

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 800)
  }

  const getInitialContent = (id: string) => {
    if (id === "privacy") {
      return `<h1>Privacy Policy</h1><p>We collect information from you when you register on our site, place an order, subscribe to our newsletter or fill out a form.</p><h2>1. Information Usage</h2><p>Any of the information we collect from you may be used in one of the following ways:</p><ul><li>To personalize your experience</li><li>To improve our website</li><li>To process transactions</li></ul>`
    }
    return `<h1>${policyTypes.find(p => p.id === id)?.label}</h1><p>Start writing your policy content here...</p>`
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Store Policies</h2>
        <p className="text-muted-foreground">
          Manage your legal and operational policy documents. These are displayed to customers during checkout and in the footer.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 bg-muted/50 border">
          {policyTypes.map(policy => (
            <TabsTrigger key={policy.id} value={policy.id}>
              {policy.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {policyTypes.map(policy => (
          <TabsContent key={policy.id} value={policy.id}>
            <Card className="border shadow-sm">
              <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between py-4">
                <div>
                  <h3 className="font-semibold text-lg">Edit {policy.label}</h3>
                  <p className="text-sm text-muted-foreground">Last updated on Oct 24, 2024</p>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`publish-${policy.id}`} className="text-sm cursor-pointer">Published</Label>
                  <Switch id={`publish-${policy.id}`} defaultChecked />
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <RichTextEditor initialContent={getInitialContent(policy.id)} />
              </CardContent>
              
              <CardFooter className="p-4 border-t bg-muted/20 flex justify-end gap-3">
                <Button variant="outline">Preview</Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
