"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Contact2, HelpCircle, Plus, Trash2, Mail, MoreHorizontal } from "lucide-react"
import { DataTable, type ColumnDef } from "@/components/data-table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Dummy data for messages
const messagesData = [
  {
    id: "1",
    date: "13 Jun 2026 10:30",
    name: "John Doe",
    email: "john@example.com",
    message: "I have a question about my recent order."
  },
  {
    id: "2",
    date: "12 Jun 2026 15:45",
    name: "Jane Smith",
    email: "jane@smith.com",
    message: "Do you ship internationally?"
  },
  {
    id: "3",
    date: "14 Jun 2026 09:12",
    name: "Daniel Edwards",
    email: "daniel@seoservices.com",
    message: "Hello, There are several incomplete steps in the backend of your website, which is causing your site to struggle to appear on Google when people search for keywords related to your business. These missing steps are primarily related to the SEO (Search Engine Optimization) setup of your website. We understand that this may not be your area of expertise, and you may need assistance completing the necessary backend work to help your website rank higher on search engines. If that is the case, kindly respond to this email with your phone number and your availability for a quick call so we can discuss the detailed solution to fix your website's issues. Thanks, Daniel Edwards"
  }
]

const columns: ColumnDef<any>[] = [
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "message",
    header: "Message",
    cell: (row: any) => {
      const msg = row.message as string;
      return (
        <Dialog>
          <DialogTrigger render={<button type="button" className="max-w-[200px] md:max-w-[300px] lg:max-w-[400px] truncate cursor-pointer text-left text-muted-foreground hover:text-foreground hover:underline transition-all" title="Click to view full message">{msg}</button>} />
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Message from {row.name}</DialogTitle>
              <DialogDescription>{row.email} • {row.date}</DialogDescription>
            </DialogHeader>
            <div className="mt-4 p-4 bg-muted/20 rounded-md border text-sm leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
              {msg}
            </div>
          </DialogContent>
        </Dialog>
      )
    }
  },
  {
    header: "Actions",
    cell: (row: any) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Message
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function ContactContent() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-8">
          <TabsTrigger value="details"><Contact2 className="w-4 h-4 mr-2" /> Contact Details</TabsTrigger>
          <TabsTrigger value="faqs"><HelpCircle className="w-4 h-4 mr-2" /> FAQs</TabsTrigger>
          <TabsTrigger value="messages"><Mail className="w-4 h-4 mr-2" /> Messages</TabsTrigger>
        </TabsList>

        <form onSubmit={(e) => e.preventDefault()}>
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Primary contact details displayed on the storefront.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input type="email" defaultValue="support@temple.org" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input defaultValue="+1 (888) 777-9999" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Website URL</Label>
                    <Input type="url" defaultValue="https://temple.org" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Physical Address</Label>
                    <Textarea rows={3} defaultValue="123 Spiritual Way, Temple City, TC 12345" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faqs">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Manage the common questions and answers displayed to users.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[1, 2].map((faq, index) => (
                    <div key={index} className="flex gap-4 items-start border p-4 rounded-lg bg-muted/10 relative">
                      <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                          <Label>Question</Label>
                          <Input defaultValue={index === 0 ? "What payment methods do you accept?" : "How long does shipping take?"} />
                        </div>
                        <div className="space-y-2">
                          <Label>Answer</Label>
                          <Textarea rows={3} defaultValue={index === 0 ? "We accept Credit/Debit Cards, UPI, and Cash on Delivery." : "Orders are typically processed within 24 hours and delivered within 3-5 business days."} />
                        </div>
                      </div>
                      <Button variant="destructive" size="icon" className="shrink-0 mt-8">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full border-dashed"><Plus className="w-4 h-4 mr-2" /> Add FAQ</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Contact Messages</CardTitle>
                <CardDescription>View and manage messages submitted by customers through the storefront contact form.</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable columns={columns} data={messagesData} keyExtractor={(item) => item.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <div className="mt-8 flex justify-end">
            <Button type="submit" size="lg">Save Changes</Button>
          </div>
        </form>
      </Tabs>
    </div>
  )
}
