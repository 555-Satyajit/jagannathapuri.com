"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Layout, LayoutPanelTop, Home, Search, Plus, Trash2 } from "lucide-react"

export function SettingsContent() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="header" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="header"><Layout className="w-4 h-4 mr-2" /> Header</TabsTrigger>
          <TabsTrigger value="footer"><LayoutPanelTop className="w-4 h-4 mr-2" /> Footer</TabsTrigger>
          <TabsTrigger value="home"><Home className="w-4 h-4 mr-2" /> Home & Timer</TabsTrigger>
          <TabsTrigger value="seo"><Search className="w-4 h-4 mr-2" /> SEO Settings</TabsTrigger>
        </TabsList>

        <form onSubmit={(e) => e.preventDefault()}>
          {/* Header Tab */}
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
                      <div className="h-20 w-20 bg-muted rounded border flex items-center justify-center overflow-hidden">
                        <span className="text-xs text-muted-foreground">Logo</span>
                      </div>
                      <div className="space-y-2">
                        <Input type="file" accept="image/*" />
                        <p className="text-xs text-muted-foreground">Allowed JPG, GIF or PNG.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Support Phone</Label>
                    <Input defaultValue="+1 (888) 777-9999" />
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-sm font-medium">Promo Banner</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Promo Banner Text</Label>
                      <Input defaultValue="Fashion Category" />
                    </div>
                    <div className="space-y-2">
                      <Label>Promo Discount Tag</Label>
                      <Input defaultValue="25% OFF" />
                    </div>
                    <div className="space-y-2">
                      <Label>Promo Suffix Text</Label>
                      <Input defaultValue="Today" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <Switch id="promo-status" defaultChecked />
                    <Label htmlFor="promo-status">Show Promo Banner</Label>
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-sm font-medium">Navbar Support Phone</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <Input defaultValue="888-777-999" />
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-sm font-medium">Navbar Navigation Links</h3>
                  <div className="space-y-4">
                    {[1, 2].map((link, index) => (
                      <div key={index} className="border p-4 rounded-md space-y-4">
                        <div className="flex gap-4 items-end">
                          <div className="flex-1 space-y-2">
                            <Label>Main Label</Label>
                            <Input defaultValue={index === 0 ? "Home" : "Shop"} />
                          </div>
                          <div className="flex-1 space-y-2">
                            <Label>Main URL</Label>
                            <Input defaultValue={index === 0 ? "/" : "/shop"} />
                          </div>
                          <Button variant="destructive" size="icon" className="shrink-0"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                        {index === 1 && (
                          <div className="pl-6 border-l-2 border-primary space-y-4 mt-4">
                            <h4 className="text-xs font-semibold text-primary uppercase">Sub Dropdown Items</h4>
                            <div className="flex gap-4 items-end">
                              <div className="flex-1 space-y-2">
                                <Label className="text-xs">Sub Label</Label>
                                <Input defaultValue="Clothing" className="h-8" />
                              </div>
                              <div className="flex-1 space-y-2">
                                <Label className="text-xs">Sub URL</Label>
                                <Input defaultValue="/shop/clothing" className="h-8" />
                              </div>
                              <Button variant="destructive" size="icon" className="h-8 w-8 shrink-0"><Trash2 className="w-3 h-3" /></Button>
                            </div>
                            <Button variant="outline" size="sm" className="h-8"><Plus className="w-3 h-3 mr-2" /> Add Sub Item</Button>
                          </div>
                        )}
                      </div>
                    ))}
                    <Button variant="default"><Plus className="w-4 h-4 mr-2" /> Add Main Link</Button>
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-sm font-medium">Top Bar Navigation Links</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4 items-end">
                      <div className="flex-1 space-y-2">
                        <Label>Label</Label>
                        <Input defaultValue="Track Order" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label>URL</Label>
                        <Input defaultValue="/track-order" />
                      </div>
                      <Button variant="destructive" size="icon" className="shrink-0"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                    <Button variant="default"><Plus className="w-4 h-4 mr-2" /> Add Link</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Footer Tab */}
          <TabsContent value="footer">
            <Card>
              <CardHeader>
                <CardTitle>Footer Settings</CardTitle>
                <CardDescription>Configure your brand description, social media links, and contact info.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Brand Description</Label>
                  <Textarea rows={3} defaultValue="Your premier destination for spiritual and Vedic supplies." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Facebook URL</Label>
                    <Input defaultValue="https://facebook.com/" />
                  </div>
                  <div className="space-y-2">
                    <Label>Instagram URL</Label>
                    <Input defaultValue="https://instagram.com/" />
                  </div>
                  <div className="space-y-2">
                    <Label>LinkedIn URL</Label>
                    <Input defaultValue="https://linkedin.com/" />
                  </div>
                </div>
                <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Contact Address</Label>
                    <Input defaultValue="123 Spiritual Way, Temple City, TC 12345" />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input defaultValue="+1 (888) 777-9999" />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <Input defaultValue="support@temple.org" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Home & Timer Tab */}
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
                    <Input defaultValue="Featured Event Ends In:" />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date & Time</Label>
                    <Input type="datetime-local" defaultValue="2026-12-31T23:59" />
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Switch id="timer-status" defaultChecked />
                  <Label htmlFor="timer-status">Timer Visible on Homepage</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Tab */}
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
                    <div className="h-16 w-16 bg-muted border flex items-center justify-center overflow-hidden">
                      <span className="text-[10px] text-muted-foreground">Favicon</span>
                    </div>
                    <div className="space-y-2">
                      <Input type="file" accept=".ico,.png" />
                      <p className="text-xs text-muted-foreground">Allowed PNG, ICO.</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-sm font-medium">Global Meta Tags</h3>
                  <div className="space-y-2">
                    <Label>Default Meta Title</Label>
                    <Input defaultValue="Temple Store | Vedic & Spiritual Supplies" />
                    <p className="text-xs text-muted-foreground text-right">43 / 60 chars (Good)</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Default Meta Description</Label>
                    <Textarea rows={3} defaultValue="Discover authentic Vedic supplies, daily rituals, and astrological panchang at our online temple store." />
                    <p className="text-xs text-muted-foreground text-right">104 / 160 chars (Excellent)</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Global Meta Keywords</Label>
                    <Input defaultValue="temple, vedic, rituals, panchang, spiritual" />
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-sm font-medium">Social Preview (Open Graph)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>OG Title</Label>
                      <Input defaultValue="Temple Store" />
                    </div>
                    <div className="space-y-2">
                      <Label>OG Description</Label>
                      <Input defaultValue="Your premier destination for spiritual and Vedic supplies." />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="mt-8 flex justify-end">
            <Button type="submit" size="lg">Save All Settings</Button>
          </div>
        </form>
      </Tabs>
    </div>
  )
}
