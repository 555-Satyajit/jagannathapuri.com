"use client"

import React, { useState, useEffect } from "react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { toast, Toaster } from "sonner"
import { format } from "date-fns"

export function ContactContent() {
  const [contact, setContact] = useState({
    email: "",
    phone: "",
    website: "",
    address: ""
  })
  
  const [faqs, setFaqs] = useState<{ question: string, answer: string }[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    try {
      // Fetch contact & faqs
      const contactRes = await fetch(`/api/admin/settings/store-contact`);
      const contactData = await contactRes.json();
      if (contactData.success) {
        setContact({
          email: contactData.data.contact.email || "",
          phone: contactData.data.contact.phone || "",
          website: contactData.data.contact.website || "",
          address: contactData.data.contact.address || ""
        });
        setFaqs(contactData.data.faqs || []);
      }

      // Fetch messages
      const msgRes = await fetch(`/api/admin/settings/store-messages`);
      const msgData = await msgRes.json();
      if (msgData.success) {
        setMessages(msgData.data);
      }
    } catch (error) {
      console.error("Failed to load contact data:", error);
      toast.error("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/settings/store-contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ contact, faqs })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Settings saved successfully.");
      } else {
        toast.error("Failed to save settings.");
      }
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  }

  const handleDeleteMessage = async (id: number) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`/api/admin/settings/store-messages/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Message deleted");
        setMessages(messages.filter((m: any) => m.id !== id));
      } else {
        toast.error("Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Error deleting message");
    }
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "created_at",
      header: "Date",
      cell: (row: any) => format(new Date(row.created_at), "dd MMM yyyy HH:mm")
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
                <DialogDescription>{row.email} • {format(new Date(row.created_at), "dd MMM yyyy HH:mm")}</DialogDescription>
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
              <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteMessage(row.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Message
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const updateContact = (field: string, value: string) => {
    setContact({ ...contact, [field]: value });
  }

  const updateFaq = (index: number, field: string, value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    setFaqs(newFaqs);
  }

  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  }

  const removeFaq = (index: number) => {
    const newFaqs = [...faqs];
    newFaqs.splice(index, 1);
    setFaqs(newFaqs);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-2 mb-8">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
              <div className="space-y-2 md:col-span-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
              <div className="space-y-2 md:col-span-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-24 w-full" /></div>
            </div>
            <div className="mt-8 flex justify-end"><Skeleton className="h-10 w-32" /></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-8">
          <TabsTrigger value="details"><Contact2 className="w-4 h-4 mr-2" /> Contact Details</TabsTrigger>
          <TabsTrigger value="faqs"><HelpCircle className="w-4 h-4 mr-2" /> FAQs</TabsTrigger>
          <TabsTrigger value="messages"><Mail className="w-4 h-4 mr-2" /> Messages</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSave}>
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
                    <Input type="email" value={contact.email} onChange={(e) => updateContact("email", e.target.value)} placeholder="support@temple.org" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={contact.phone} onChange={(e) => updateContact("phone", e.target.value)} placeholder="+91 999999999" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Website URL</Label>
                    <Input type="url" value={contact.website} onChange={(e) => updateContact("website", e.target.value)} placeholder="https://temple.org" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Physical Address</Label>
                    <Textarea rows={3} value={contact.address} onChange={(e) => updateContact("address", e.target.value)} placeholder="123 Spiritual Way, Temple City" />
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <Button type="submit" size="lg" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
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
                  {faqs.map((faq, index) => (
                    <div key={index} className="flex gap-4 items-start border p-4 rounded-lg bg-muted/10 relative">
                      <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                          <Label>Question</Label>
                          <Input value={faq.question} onChange={(e) => updateFaq(index, "question", e.target.value)} placeholder="Question text" />
                        </div>
                        <div className="space-y-2">
                          <Label>Answer</Label>
                          <Textarea rows={3} value={faq.answer} onChange={(e) => updateFaq(index, "answer", e.target.value)} placeholder="Answer text" />
                        </div>
                      </div>
                      <Button type="button" onClick={() => removeFaq(index)} variant="destructive" size="icon" className="shrink-0 mt-8">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" onClick={addFaq} variant="outline" className="w-full border-dashed"><Plus className="w-4 h-4 mr-2" /> Add FAQ</Button>
                </div>
                <div className="mt-8 flex justify-end">
                  <Button type="submit" size="lg" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </form>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Contact Messages</CardTitle>
              <CardDescription>View and manage messages submitted by customers through the storefront contact form.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={messages} keyExtractor={(item: any) => item.id.toString()} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Toaster position="top-center" richColors />
    </div>
  )
}
