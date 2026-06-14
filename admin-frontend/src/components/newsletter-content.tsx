"use client"

import * as React from "react"
import { DataTable, type ColumnDef } from "@/components/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Mail } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Dummy Data
const dummySubscribers = [
  { id: 1, email: "dev@example.com", status: "Subscribed", createdAt: "2026-06-12T14:30:00Z" },
  { id: 2, email: "info@temple.org", status: "Subscribed", createdAt: "2026-06-10T09:15:00Z" },
  { id: 3, email: "testuser@gmail.com", status: "Unsubscribed", createdAt: "2026-05-28T16:45:00Z" },
]

export function NewsletterContent() {
  const columns: ColumnDef<typeof dummySubscribers[0]>[] = [
    {
      header: "Email",
      accessorKey: "email",
      cell: (item) => (
        <div className="flex items-center gap-2 font-medium">
          <Mail className="h-4 w-4 text-muted-foreground" />
          {item.email}
        </div>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item) => (
        <Badge variant="secondary" className={item.status === 'Subscribed' ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none" : "bg-muted text-muted-foreground border-none"}>
          {item.status}
        </Badge>
      )
    },
    {
      header: "Subscribed At",
      accessorKey: "createdAt",
      cell: (item) => (
        <span className="text-muted-foreground">
          {new Date(item.createdAt).toLocaleString('en-GB', { 
            day: '2-digit', month: 'short', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
          })}
        </span>
      )
    },
    {
      header: "Actions",
      className: "text-right",
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Actions</div>
            <DropdownMenuItem className="text-destructive">Delete Subscriber</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle>Subscribers List</CardTitle>
            <CardDescription>All users who have opted in to receive the newsletter.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable data={dummySubscribers} columns={columns} keyExtractor={(item) => item.id} />
        </CardContent>
      </Card>
    </div>
  )
}
