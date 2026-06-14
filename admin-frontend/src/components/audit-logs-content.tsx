"use client"

import * as React from "react"
import { 
  Search, ShieldAlert, History, Activity, Fingerprint, 
  RefreshCcw, Eye, Download, ShieldCheck
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const auditData = [
  { id: "LOG-0992", time: "Oct 24, 2024 - 14:32:01", user: "Admin User", email: "admin@store.com", action: "UPDATE", resource: "Product #P-1002", ip: "192.168.1.45", status: "Success" },
  { id: "LOG-0991", time: "Oct 24, 2024 - 13:15:22", user: "John Staff", email: "john@store.com", action: "CREATE", resource: "Order #ORD-7352", ip: "10.0.0.12", status: "Success" },
  { id: "LOG-0990", time: "Oct 24, 2024 - 11:05:59", user: "System", email: "system", action: "DELETE", resource: "Expired Session Token", ip: "127.0.0.1", status: "Success" },
  { id: "LOG-0989", time: "Oct 24, 2024 - 09:45:11", user: "Unknown", email: "unknown", action: "LOGIN", resource: "Admin Portal", ip: "45.22.11.90", status: "Failed" },
  { id: "LOG-0988", time: "Oct 23, 2024 - 16:20:00", user: "Admin User", email: "admin@store.com", action: "UPDATE", resource: "Privacy Policy", ip: "192.168.1.45", status: "Success" },
  { id: "LOG-0987", time: "Oct 23, 2024 - 15:10:30", user: "Jane Staff", email: "jane@store.com", action: "LOGIN", resource: "Admin Portal", ip: "192.168.1.88", status: "Success" },
  { id: "LOG-0986", time: "Oct 23, 2024 - 10:05:15", user: "Admin User", email: "admin@store.com", action: "CREATE", resource: "Discount Code #WINTER24", ip: "192.168.1.45", status: "Success" },
]

export function AuditLogsContent() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Audit Logs</h2>
          <p className="text-muted-foreground">
            Track and monitor all administrative actions and security events across your store.
          </p>
        </div>
        <Button variant="outline" className="shrink-0">
          <Download className="mr-2 h-4 w-4" /> Export Logs (CSV)
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Events</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">14,209</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
            </div>
            <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <History className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">System Changes</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">842</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Updates and Deletions</p>
            </div>
            <div className="h-12 w-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center">
              <Activity className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Failed Logins</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">23</h3>
              </div>
              <p className="text-xs text-rose-500 font-medium mt-1">Needs attention</p>
            </div>
            <div className="h-12 w-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center">
              <ShieldAlert className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Unique IPs</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">14</h3>
              </div>
              <p className="text-xs text-emerald-500 font-medium mt-1">Authorized networks</p>
            </div>
            <div className="h-12 w-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
              <Fingerprint className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center p-4 border-b gap-4 bg-muted/20">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search logs by Resource, Email, or IP..." 
              className="pl-9 w-full bg-background"
            />
          </div>
          <div className="flex w-full sm:w-auto gap-2 sm:ml-auto">
            <Select>
              <SelectTrigger className="w-full sm:w-[160px] bg-background">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">CREATE</SelectItem>
                <SelectItem value="update">UPDATE</SelectItem>
                <SelectItem value="delete">DELETE</SelectItem>
                <SelectItem value="login">LOGIN</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full sm:w-[160px] bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="shrink-0" title="Refresh Logs">
              <RefreshCcw className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 whitespace-nowrap">
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditData.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-muted-foreground whitespace-nowrap font-mono text-xs">
                    {log.time}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border">
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-medium">
                          {log.user === "System" ? "SYS" : log.user === "Unknown" ? "?" : log.user.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{log.user}</span>
                        <span className="text-xs text-muted-foreground">{log.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      log.action === "CREATE" ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/5" :
                      log.action === "UPDATE" ? "border-blue-500/30 text-blue-600 bg-blue-500/5" :
                      log.action === "DELETE" ? "border-rose-500/30 text-rose-600 bg-rose-500/5" :
                      "border-amber-500/30 text-amber-600 bg-amber-500/5"
                    }>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {log.resource}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.ip}
                  </TableCell>
                  <TableCell>
                    {log.status === "Success" ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                        <ShieldCheck className="h-4 w-4" /> Success
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-rose-600 text-sm font-medium">
                        <ShieldAlert className="h-4 w-4" /> Failed
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8">
                      <Eye className="mr-2 h-4 w-4" /> Inspect
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground">
          <div>Showing 1-7 of 14,209 logs</div>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}
