"use client"

import * as React from "react"
import { ChevronLeft, Image as ImageIcon, X } from "lucide-react"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function LibraryContentAdd() {
  const [content, setContent] = React.useState("")
  const [previewImage, setPreviewImage] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewImage(url)
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/admin/library/categories">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Add Article</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Create and publish a new article to the library.
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link href="/admin/library/categories">
            <Button variant="outline" className="w-full sm:w-auto">Discard</Button>
          </Link>
          <Button className="w-full sm:w-auto">Publish Article</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="art-title">Title</Label>
                  <Input id="art-title" placeholder="e.g. History of the Temple" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="art-slug">Slug</Label>
                  <Input id="art-slug" placeholder="history-of-the-temple" readOnly className="bg-muted" />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="art-subtitle">Subtitle</Label>
                <Input id="art-subtitle" placeholder="A brief spiritual analysis..." />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="art-summary">Summary (Grid View)</Label>
                <Textarea id="art-summary" placeholder="Summary for cards..." rows={2} />
              </div>

              <div className="grid gap-2 pt-4">
                <Label>Main Content</Label>
                <RichTextEditor 
                  value={content} 
                  onChange={setContent} 
                  placeholder="Write your beautiful content here..." 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO & Meta Tags</CardTitle>
              <CardDescription>Optimize this article for search engines.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="meta-title">Meta Title</Label>
                  <span className="text-xs text-muted-foreground">0 / 60</span>
                </div>
                <Input id="meta-title" placeholder="SEO Title" />
              </div>
              
              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="meta-desc">Meta Description</Label>
                  <span className="text-xs text-muted-foreground">0 / 160</span>
                </div>
                <Textarea id="meta-desc" placeholder="SEO Description" rows={3} />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="meta-keys">Meta Keywords</Label>
                <Input id="meta-keys" placeholder="keyword1, keyword2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select defaultValue="pooja">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pooja">Pooja Methods</SelectItem>
                    <SelectItem value="vedic">Vedic Chants</SelectItem>
                    <SelectItem value="festivals">Festivals Guide</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Tags</Label>
                <Input placeholder="Type tags separated by comma..." />
              </div>

              <div className="grid gap-2">
                <Label>Author</Label>
                <Input defaultValue="Jagannathapuri Team" />
              </div>

              <div className="grid gap-2">
                <Label>Status</Label>
                <Select defaultValue="active">
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Label>Banner Image</Label>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                />
                {!previewImage ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer bg-muted/20"
                  >
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground text-center">Click to upload<br/>16:9 Banner Image</span>
                  </div>
                ) : (
                  <div className="relative border rounded-lg overflow-hidden group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewImage} alt="Banner Preview" className="w-full h-auto object-cover aspect-video" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => {
                          setPreviewImage(null)
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                      >
                        <X className="h-4 w-4 mr-2" /> Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
