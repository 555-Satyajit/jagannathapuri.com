"use client"

import * as React from "react"
import { ChevronLeft, Image as ImageIcon, X, Wand2, Loader2 } from "lucide-react"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function LibraryContentAdd() {
  const [content, setContent] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [subtitle, setSubtitle] = React.useState("")
  const [summary, setSummary] = React.useState("")
  const [metaTitle, setMetaTitle] = React.useState("")
  const [metaDesc, setMetaDesc] = React.useState("")
  const [metaKeys, setMetaKeys] = React.useState("")
  const [tags, setTags] = React.useState("")
  const [category, setCategory] = React.useState("")
  const [status, setStatus] = React.useState("Active")
  const [categories, setCategories] = React.useState<any[]>([])
  const [isCategoriesLoading, setIsCategoriesLoading] = React.useState(true)

  React.useEffect(() => {
    setIsCategoriesLoading(true)
    fetch('/api/admin/library/categories/data')
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setCategories(data.data)
          if (data.data.length > 0) {
            setCategory(data.data[0].id.toString())
          }
        }
      })
      .catch(err => console.error("Failed to load categories", err))
      .finally(() => setIsCategoriesLoading(false))
  }, [])

  const [aiTopic, setAiTopic] = React.useState("")
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [isPublishing, setIsPublishing] = React.useState(false)
  const router = useRouter()

  const [previewImage, setPreviewImage] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewImage(url)
    }
  }

  const generateWithAI = async () => {
    if (!aiTopic) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/admin/library/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ topic: aiTopic })
      });
      const result = await res.json();
      if (result.success && result.data) {
        const d = result.data;
        if (d.title) {
          setTitle(d.title);
          setSlug(d.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
        if (d.subtitle) setSubtitle(d.subtitle);
        if (d.summary) setSummary(d.summary);
        if (d.content) setContent(d.content);
        if (d.meta_title) setMetaTitle(d.meta_title);
        if (d.meta_desc) setMetaDesc(d.meta_desc);
        if (d.meta_keys) setMetaKeys(d.meta_keys);
        if (d.tags) setTags(d.tags);
        // We leave it to the user to double check the category.
        toast.success("Content generated successfully!")
      } else {
        toast.error('Failed to generate content. Please try again.')
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred during AI generation.')
    } finally {
      setIsGenerating(false);
    }
  }

  const handlePublish = async () => {
    if (!title) return toast.error("Title is required")
    if (!category || category === "none") return toast.error("Category is required")
    if (!content) return toast.error("Content is required")

    setIsPublishing(true)
    try {
      const formData = new FormData()
      formData.append('title', title)
      if (subtitle) formData.append('subtitle', subtitle)
      if (summary) formData.append('summary', summary)
      formData.append('content', content)
      formData.append('categoryId', category)
      formData.append('status', status)
      if (tags) formData.append('tags', tags)
      if (metaTitle) formData.append('meta_title', metaTitle)
      if (metaDesc) formData.append('meta_description', metaDesc)
      if (metaKeys) formData.append('meta_keywords', metaKeys)
      
      if (fileInputRef.current?.files?.[0]) {
        formData.append('image', fileInputRef.current.files[0])
      }

      const res = await fetch('/api/admin/library/content/save', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Article published successfully!")
        router.push("/admin/library/categories")
      } else {
        toast.error(data.error || "Failed to publish article")
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred while publishing.")
    } finally {
      setIsPublishing(false)
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
          <Button onClick={handlePublish} disabled={isPublishing} className="w-full sm:w-auto">
            {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Publish Article
          </Button>
        </div>
      </div>

      {/* AI Assistant Section */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Wand2 className="h-5 w-5" /> AI Article Generator
          </CardTitle>
          <CardDescription>
            Enter a topic and let AI draft the article, summary, and SEO metadata for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input 
              placeholder="e.g. History and Significance of the Ratha Yatra" 
              className="flex-1 bg-background"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') generateWithAI() }}
            />
            <Button onClick={generateWithAI} disabled={!aiTopic || isGenerating} className="sm:w-32">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
            </Button>
          </div>
        </CardContent>
      </Card>

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
                  <Input id="art-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. History of the Temple" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="art-slug">Slug</Label>
                  <Input id="art-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="history-of-the-temple" readOnly className="bg-muted" />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="art-subtitle">Subtitle</Label>
                <Input id="art-subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="A brief spiritual analysis..." />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="art-summary">Summary (Grid View)</Label>
                <Textarea id="art-summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Summary for cards..." rows={2} />
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
                  <span className="text-xs text-muted-foreground">{metaTitle.length} / 60</span>
                </div>
                <Input id="meta-title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="SEO Title" />
              </div>
              
              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="meta-desc">Meta Description</Label>
                  <span className="text-xs text-muted-foreground">{metaDesc.length} / 160</span>
                </div>
                <Textarea id="meta-desc" value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} placeholder="SEO Description" rows={3} />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="meta-keys">Meta Keywords</Label>
                <Input id="meta-keys" value={metaKeys} onChange={(e) => setMetaKeys(e.target.value)} placeholder="keyword1, keyword2" />
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
                <Select value={category} onValueChange={(val) => setCategory(val || "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={isCategoriesLoading ? "Loading..." : categories.length === 0 ? "No categories exist" : "Select Category"}>
                      {category ? categories.find(c => c.id.toString() === category)?.name : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 && (
                      <SelectItem value="none" disabled>No categories exist yet</SelectItem>
                    )}
                    {categories.map((c: any) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Tags</Label>
                <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Type tags separated by comma..." />
              </div>

              <div className="grid gap-2">
                <Label>Author</Label>
                <Input defaultValue="Jagannathapuri Team" />
              </div>

              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(val) => setStatus(val || "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
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
