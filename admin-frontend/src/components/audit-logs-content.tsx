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
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

// We will fetch this dynamically
// const auditData = [...]

export function AuditLogsContent() {
  const [logs, setLogs] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [total, setTotal] = React.useState(0)
  const [stats, setStats] = React.useState({
    totalEvents: 0,
    systemChanges: 0,
    failedLogins: 0,
    uniqueIps: 0
  })
  
  const [search, setSearch] = React.useState("")
  const [actionType, setActionType] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const limit = 10

  React.useEffect(() => {
    fetchLogs(page)
  }, [page, actionType, statusFilter])

  const fetchLogs = async (currentPage: number = page) => {
    setIsLoading(true)
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      })
      if (search) query.append('search', search)
      if (actionType !== 'all') query.append('action', actionType)
      if (statusFilter !== 'all') query.append('status', statusFilter)

      const res = await fetch(`/api/admin/settings/audit-logs/data?${query.toString()}`)
      if (res.ok) {
        const json = await res.json()
        setLogs(json.data || [])
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages)
          setTotal(json.pagination.total)
          setPage(json.pagination.page)
        }
        if (json.stats) {
          setStats(json.stats)
        }
      }
    } catch (err) {
      console.error("Failed to fetch logs", err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    const d = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
    const datePart = d.toLocaleDateString('en-US', options)
    const timePart = d.toLocaleTimeString('en-US', { hour12: false })
    return `${datePart} - ${timePart}`
  }

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
                {isLoading ? <Skeleton className="h-8 w-20" /> : <h3 className="text-2xl font-bold">{stats.totalEvents.toLocaleString()}</h3>}
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
                {isLoading ? <Skeleton className="h-8 w-20" /> : <h3 className="text-2xl font-bold">{stats.systemChanges.toLocaleString()}</h3>}
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
                {isLoading ? <Skeleton className="h-8 w-20" /> : <h3 className="text-2xl font-bold">{stats.failedLogins.toLocaleString()}</h3>}
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
                {isLoading ? <Skeleton className="h-8 w-20" /> : <h3 className="text-2xl font-bold">{stats.uniqueIps.toLocaleString()}</h3>}
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
              placeholder="Search logs by Resource, Email, or IP..." 
              className="pl-8 w-full bg-background" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); fetchLogs(1); } }}
            />
          </div>
          <div className="flex w-full sm:w-auto gap-2 sm:ml-auto">
            <Select value={actionType} onValueChange={(val) => { setActionType(val || "all"); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-36 bg-background">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="login">Login</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val || "all"); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-32 bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="shrink-0" title="Refresh Logs" onClick={() => fetchLogs(page)}>
              <RefreshCcw className={`h-4 w-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
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
              {isLoading ? (
                <TableSkeleton columns={7} rows={limit} />
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">No audit logs found.</TableCell>
                </TableRow>
              ) : logs.map((log) => {
                const user = log.admin?.full_name || "Unknown"
                const action = log.action || "UNKNOWN"
                const resource = log.entity ? `${log.entity} ${log.entityId ? `#${log.entityId}` : ''}` : "System"
                const ip = log.ipAddress || "N/A"
                // Assuming all logs we have stored are successful actions since there's no status field
                const status = action === "LOGIN_FAILED" ? "Failed" : "Success"
                
                return (
                <TableRow key={log.id}>
                  <TableCell className="text-muted-foreground whitespace-nowrap font-mono text-xs">
                    {formatTime(log.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border">
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-medium">
                          {user === "System" ? "SYS" : user === "Unknown" ? "?" : user.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{user}</span>
                        <span className="text-xs text-muted-foreground">{log.admin?.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      action.includes("CREATE") ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/5" :
                      action.includes("UPDATE") ? "border-blue-500/30 text-blue-600 bg-blue-500/5" :
                      action.includes("DELETE") ? "border-rose-500/30 text-rose-600 bg-rose-500/5" :
                      "border-amber-500/30 text-amber-600 bg-amber-500/5"
                    }>
                      {action.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {resource}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {ip}
                  </TableCell>
                  <TableCell>
                    {status === "Success" ? (
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
              )})}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {total === 0 ? 0 : (page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total} logs
          </div>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1); }} 
                  className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {[...Array(totalPages || 1)].map((_, i) => {
                const p = i + 1;
                if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink 
                        href="#" 
                        isActive={page === p}
                        onClick={(e) => { e.preventDefault(); setPage(p); }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                if (p === page - 2 || p === page + 2) {
                  return (
                    <PaginationItem key={p}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(page + 1); }} 
                  className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}
