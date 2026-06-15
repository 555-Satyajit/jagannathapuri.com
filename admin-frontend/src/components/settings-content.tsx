"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Layout, LayoutPanelTop, Home, Search, Plus, Trash2, Loader2, Save } from "lucide-react"
import { toast, Toaster } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export function SettingsContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [faviconFile, setFaviconFile] = useState<File | null>(null)

  const [headerSettings, setHeaderSettings] = useState({
    logo: "",
    supportPhone: "",
    promoBannerText: "",
    promoDiscountTag: "",
    promoSuffixText: "",
    showPromoBanner: true,
    navbarSupportPhone: "",
    navLinks: [] as any[],
    topBarLinks: [] as any[],
  })

  const [footerSettings, setFooterSettings] = useState({
    brandDescription: "",
    facebookUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    contactAddress: "",
    contactPhone: "",
    contactEmail: "",
  })

  const [homeSettings, setHomeSettings] = useState({
    timerTitle: "",
    timerEndDate: "",
    showTimer: true,
  })

  const [seoSettings, setSeoSettings] = useState({
    favicon: "",
    defaultMetaTitle: "",
    defaultMetaDescription: "",
    globalMetaKeywords: "",
    ogTitle: "",
    ogDescription: "",
  })

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    let cleanPath = path;
    if (cleanPath.startsWith('/uploads/')) {
        cleanPath = cleanPath.replace('/uploads/', '');
    }
    return `http://localhost:5000/uploads/${cleanPath}`;
  }

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings/general')
        const json = await res.json()
        if (json.success && json.data) {
          if (json.data.header) setHeaderSettings(prev => ({ ...prev, ...json.data.header }))
          if (json.data.footer) setFooterSettings(prev => ({ ...prev, ...json.data.footer }))
          if (json.data.home_timer) setHomeSettings(prev => ({ ...prev, ...json.data.home_timer }))
          if (json.data.seo) setSeoSettings(prev => ({ ...prev, ...json.data.seo }))
        }
      } catch (error) {
        console.error("Failed to fetch settings", error)
        toast.error("Failed to load settings.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const formData = new FormData()
      
      const payload = {
        header: headerSettings,
        footer: footerSettings,
        home_timer: homeSettings,
        seo: seoSettings,
      }
      
      formData.append("settings", JSON.stringify(payload))
      
      if (logoFile) formData.append("logo", logoFile)
      if (faviconFile) formData.append("favicon", faviconFile)

      const res = await fetch('/api/admin/settings/general', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()
      if (json.success) {
        toast.success("Settings saved successfully!")
      } else {
        toast.error(json.error || "Failed to save settings.")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("An unexpected error occurred.")
    } finally {
      setIsSaving(false)
    }
  }

  const addNavLink = () => {
    setHeaderSettings(prev => ({
      ...prev,
      navLinks: [...(prev.navLinks || []), { label: "New Link", url: "/", subItems: [] }]
    }))
  }

  const updateNavLink = (index: number, key: string, value: string) => {
    const newLinks = [...(headerSettings.navLinks || [])]
    newLinks[index][key] = value
    setHeaderSettings({ ...headerSettings, navLinks: newLinks })
  }

  const removeNavLink = (index: number) => {
    const newLinks = [...(headerSettings.navLinks || [])]
    newLinks.splice(index, 1)
    setHeaderSettings({ ...headerSettings, navLinks: newLinks })
  }

  const addSubLink = (index: number) => {
    const newLinks = [...(headerSettings.navLinks || [])]
    if (!newLinks[index].sub_links) newLinks[index].sub_links = []
    newLinks[index].sub_links.push({ label: "New Sub Link", url: "#" })
    setHeaderSettings({ ...headerSettings, navLinks: newLinks })
  }

  const updateSubLink = (mainIndex: number, subIndex: number, key: string, value: string) => {
    const newLinks = [...(headerSettings.navLinks || [])]
    newLinks[mainIndex].sub_links[subIndex][key] = value
    setHeaderSettings({ ...headerSettings, navLinks: newLinks })
  }

  const removeSubLink = (mainIndex: number, subIndex: number) => {
    const newLinks = [...(headerSettings.navLinks || [])]
    newLinks[mainIndex].sub_links.splice(subIndex, 1)
    setHeaderSettings({ ...headerSettings, navLinks: newLinks })
  }

  const addTopBarLink = () => {
    setHeaderSettings(prev => ({
      ...prev,
      topBarLinks: [...(prev.topBarLinks || []), { label: "New Link", url: "/" }]
    }))
  }

  const updateTopBarLink = (index: number, key: string, value: string) => {
    const newLinks = [...(headerSettings.topBarLinks || [])]
    newLinks[index][key] = value
    setHeaderSettings({ ...headerSettings, topBarLinks: newLinks })
  }

  const removeTopBarLink = (index: number) => {
    const newLinks = [...(headerSettings.topBarLinks || [])]
    newLinks.splice(index, 1)
    setHeaderSettings({ ...headerSettings, topBarLinks: newLinks })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full mb-8" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-48 w-full mt-6" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-center" richColors />
      <Tabs defaultValue="header" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="header"><Layout className="w-4 h-4 mr-2" /> Header</TabsTrigger>
          <TabsTrigger value="footer"><LayoutPanelTop className="w-4 h-4 mr-2" /> Footer</TabsTrigger>
          <TabsTrigger value="home"><Home className="w-4 h-4 mr-2" /> Home & Timer</TabsTrigger>
          <TabsTrigger value="seo"><Search className="w-4 h-4 mr-2" /> SEO Settings</TabsTrigger>
        </TabsList>

        <form onSubmit={(e) => e.preventDefault()}>
          <TabsContent value="header">
            <Card>
              <CardHeader>
                <CardTitle>Header Settings</CardTitle>
                <CardDescription>Manage your site logo, promo banner, and navigation links.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Site Logo</Label>
                    <div className="flex items-center gap-4">
                      {headerSettings.logo || logoFile ? (
                        <div className="h-20 w-20 bg-muted rounded border flex items-center justify-center overflow-hidden">
                          <img src={logoFile ? URL.createObjectURL(logoFile) : getImageUrl(headerSettings.logo)} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="h-20 w-20 bg-muted rounded border flex items-center justify-center overflow-hidden">
                          <span className="text-xs text-muted-foreground">Logo</span>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} />
                        <p className="text-xs text-muted-foreground">Allowed JPG, GIF or PNG.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Support Phone</Label>
                    <Input value={headerSettings.supportPhone} onChange={e => setHeaderSettings({...headerSettings, supportPhone: e.target.value})} />
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-sm font-medium">Promo Banner</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Promo Banner Text</Label>
                      <Input value={headerSettings.promoBannerText} onChange={e => setHeaderSettings({...headerSettings, promoBannerText: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Promo Discount Tag</Label>
                      <Input value={headerSettings.promoDiscountTag} onChange={e => setHeaderSettings({...headerSettings, promoDiscountTag: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Promo Suffix Text</Label>
                      <Input value={headerSettings.promoSuffixText} onChange={e => setHeaderSettings({...headerSettings, promoSuffixText: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <Switch id="promo-status" checked={headerSettings.showPromoBanner} onCheckedChange={c => setHeaderSettings({...headerSettings, showPromoBanner: c})} />
                    <Label htmlFor="promo-status">Show Promo Banner</Label>
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-sm font-medium">Navbar Support Phone</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <Input value={headerSettings.navbarSupportPhone} onChange={e => setHeaderSettings({...headerSettings, navbarSupportPhone: e.target.value})} />
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-sm font-medium">Navbar Navigation Links</h3>
                  <div className="space-y-4">
                    {(headerSettings.navLinks || []).map((link, index) => (
                      <div key={index} className="border p-4 rounded-md space-y-4">
                        <div className="flex gap-4 items-end">
                          <div className="flex-1 space-y-2">
                            <Label>Main Label</Label>
                            <Input value={link.label} onChange={e => updateNavLink(index, 'label', e.target.value)} />
                          </div>
                          <div className="flex-1 space-y-2">
                            <Label>Main URL</Label>
                            <Input value={link.url} onChange={e => updateNavLink(index, 'url', e.target.value)} />
                          </div>
                          <Button type="button" variant="destructive" size="icon" className="shrink-0" onClick={() => removeNavLink(index)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                        <div className="pl-6 border-l-2 border-primary space-y-4 mt-4">
                          <h4 className="text-xs font-semibold text-primary uppercase">Sub Dropdown Items</h4>
                          {(link.sub_links || []).map((sub: any, subIndex: number) => (
                            <div key={subIndex} className="flex gap-4 items-end">
                              <div className="flex-1 space-y-2">
                                <Label className="text-xs">Sub Label</Label>
                                <Input value={sub.label} onChange={e => updateSubLink(index, subIndex, 'label', e.target.value)} className="h-8" />
                              </div>
                              <div className="flex-1 space-y-2">
                                <Label className="text-xs">Sub URL</Label>
                                <Input value={sub.url} onChange={e => updateSubLink(index, subIndex, 'url', e.target.value)} className="h-8" />
                              </div>
                              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => removeSubLink(index, subIndex)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          ))}
                          <Button type="button" variant="outline" size="sm" onClick={() => addSubLink(index)}><Plus className="w-3 h-3 mr-2" /> Add Sub Item</Button>
                        </div>
                      </div>
                    ))}
                    <Button type="button" variant="default" onClick={addNavLink}><Plus className="w-4 h-4 mr-2" /> Add Main Link</Button>
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-sm font-medium">Top Bar Navigation Links</h3>
                  <div className="space-y-4">
                    {(headerSettings.topBarLinks || []).map((link: any, index: number) => (
                      <div key={index} className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                          <Label>Label</Label>
                          <Input value={link.label} onChange={e => updateTopBarLink(index, 'label', e.target.value)} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label>URL</Label>
                          <Input value={link.url} onChange={e => updateTopBarLink(index, 'url', e.target.value)} />
                        </div>
                        <Button type="button" variant="destructive" size="icon" className="shrink-0" onClick={() => removeTopBarLink(index)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    ))}
                    <Button type="button" variant="default" onClick={addTopBarLink}><Plus className="w-4 h-4 mr-2" /> Add Link</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="footer">
            <Card>
              <CardHeader>
                <CardTitle>Footer Settings</CardTitle>
                <CardDescription>Configure your brand description, social media links, and contact info.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Brand Description</Label>
                  <Textarea rows={3} value={footerSettings.brandDescription} onChange={e => setFooterSettings({...footerSettings, brandDescription: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Facebook URL</Label>
                    <Input value={footerSettings.facebookUrl} onChange={e => setFooterSettings({...footerSettings, facebookUrl: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Instagram URL</Label>
                    <Input value={footerSettings.instagramUrl} onChange={e => setFooterSettings({...footerSettings, instagramUrl: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>LinkedIn URL</Label>
                    <Input value={footerSettings.linkedinUrl} onChange={e => setFooterSettings({...footerSettings, linkedinUrl: e.target.value})} />
                  </div>
                </div>
                <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Contact Address</Label>
                    <Input value={footerSettings.contactAddress} onChange={e => setFooterSettings({...footerSettings, contactAddress: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input value={footerSettings.contactPhone} onChange={e => setFooterSettings({...footerSettings, contactPhone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <Input value={footerSettings.contactEmail} onChange={e => setFooterSettings({...footerSettings, contactEmail: e.target.value})} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="home">
            <Card>
              <CardHeader>
                <CardTitle>Home & Timer Settings</CardTitle>
                <CardDescription>Configure the global countdown timer displayed on the homepage.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Timer Title</Label>
                    <Input value={homeSettings.timerTitle} onChange={e => setHomeSettings({...homeSettings, timerTitle: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date & Time</Label>
                    <Input type="datetime-local" value={homeSettings.timerEndDate} onChange={e => setHomeSettings({...homeSettings, timerEndDate: e.target.value})} />
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Switch id="timer-status" checked={homeSettings.showTimer} onCheckedChange={c => setHomeSettings({...homeSettings, showTimer: c})} />
                  <Label htmlFor="timer-status">Timer Visible on Homepage</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>Manage global search engine optimization and Open Graph tags.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Favicon (32x32 or 64x64 PNG/ICO)</Label>
                  <div className="flex items-center gap-4">
                    {seoSettings.favicon || faviconFile ? (
                      <div className="h-16 w-16 bg-muted border flex items-center justify-center overflow-hidden">
                        <img src={faviconFile ? URL.createObjectURL(faviconFile) : getImageUrl(seoSettings.favicon)} alt="Favicon" className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="h-16 w-16 bg-muted border flex items-center justify-center overflow-hidden">
                        <span className="text-[10px] text-muted-foreground">Favicon</span>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Input type="file" accept=".ico,.png" onChange={e => setFaviconFile(e.target.files?.[0] || null)} />
                      <p className="text-xs text-muted-foreground">Allowed PNG, ICO.</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-sm font-medium">Global Meta Tags</h3>
                  <div className="space-y-2">
                    <Label>Default Meta Title</Label>
                    <Input value={seoSettings.defaultMetaTitle} onChange={e => setSeoSettings({...seoSettings, defaultMetaTitle: e.target.value})} />
                    <p className="text-xs text-muted-foreground text-right">{seoSettings.defaultMetaTitle?.length || 0} / 60 chars</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Default Meta Description</Label>
                    <Textarea rows={3} value={seoSettings.defaultMetaDescription} onChange={e => setSeoSettings({...seoSettings, defaultMetaDescription: e.target.value})} />
                    <p className="text-xs text-muted-foreground text-right">{seoSettings.defaultMetaDescription?.length || 0} / 160 chars</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Global Meta Keywords</Label>
                    <Input value={seoSettings.globalMetaKeywords} onChange={e => setSeoSettings({...seoSettings, globalMetaKeywords: e.target.value})} />
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-sm font-medium">Social Preview (Open Graph)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>OG Title</Label>
                      <Input value={seoSettings.ogTitle} onChange={e => setSeoSettings({...seoSettings, ogTitle: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>OG Description</Label>
                      <Input value={seoSettings.ogDescription} onChange={e => setSeoSettings({...seoSettings, ogDescription: e.target.value})} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="mt-8 flex justify-end">
            <Button type="button" onClick={handleSave} disabled={isSaving} size="lg">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save All Settings
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  )
}
