"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, MousePointerClick, RefreshCw, BookOpen, Repeat, ExternalLink } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Label } from "recharts"

import { Skeleton } from "@/components/ui/skeleton"

const hitsConfig = {
  total: { label: "Total Hits", color: "var(--color-primary)" },
  library: { label: "Library Reads", color: "hsl(var(--muted-foreground))" },
};

const sectionConfig = {
  Library: { label: "Library", color: "var(--color-primary)" },
  Store: { label: "Store", color: "#10b981" },
  Home: { label: "Home", color: "#0ea5e9" },
  Other: { label: "Other", color: "hsl(var(--muted-foreground))" },
};

export function EngagementContent() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/admin/analytics/engagement', {
          headers: { 'Accept': 'application/json' }
        })
        const result = await res.json()
        if (result.success) {
          setData(result.data)
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
          <Skeleton className="h-8 w-48 rounded" />
          <Skeleton className="h-10 w-[300px] rounded" />
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[350px] rounded-xl" />
          <Skeleton className="lg:col-span-1 h-[350px] rounded-xl" />
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
        
        {/* Customers Table */}
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  // Fallback to empty if no data
  const safeData = data || {
    engagementRate: 0,
    retentionRate: 0,
    libraryEngagementRate: 0,
    libraryRetentionRate: 0,
    dailyHits: [],
    sectionPopularity: [],
    categoryInterest: [],
    topContent: [],
    recentCustomers: []
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <h2 className="text-xl font-bold tracking-tight">Analytics Filters</h2>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                />
              }
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date range</span>}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
              />
            </PopoverContent>
          </Popover>
          <Button>Filter</Button>
          <Button variant="outline">Reset</Button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Site Engagement</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <MousePointerClick className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{safeData.engagementRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Interactions per visit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Site Retention</CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <RefreshCw className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{safeData.retentionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Returning users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Library Engagement</CardTitle>
            <div className="h-8 w-8 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <BookOpen className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{safeData.libraryEngagementRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Reader depth</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Library Retention</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Repeat className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{safeData.libraryRetentionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Loyal readers</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Engagement Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily Engagement Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={hitsConfig} className="h-[300px] w-full">
              <AreaChart data={safeData.dailyHits} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillLibrary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-library)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="var(--color-library)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="total" stroke="var(--color-total)" fill="url(#fillTotal)" strokeWidth={2} />
                <Area type="monotone" dataKey="library" stroke="var(--color-library)" fill="url(#fillLibrary)" strokeWidth={2} />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Section Popularity */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle>Section Popularity</CardTitle>
            <CardDescription>General traffic distribution</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={sectionConfig} className="mx-auto aspect-square max-h-[250px]">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={safeData.sectionPopularity}
                  dataKey="views"
                  nameKey="section"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  strokeWidth={4}
                  paddingAngle={4}
                />
                <ChartLegend content={<ChartLegendContent />} className="-translate-y-2 flex-wrap gap-2 [&>*]:justify-center" />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Content */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Library Content</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeData.topContent.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <a href={item.url} className="font-medium flex items-center hover:text-primary transition-colors">
                        {item.title} <ExternalLink className="ml-2 h-3 w-3 text-muted-foreground" />
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20 border-none">
                        {item.hits.toLocaleString()} hits
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Category Interest */}
        <Card>
          <CardHeader>
            <CardTitle>Category Interest</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ views: { label: "Views", color: "var(--color-primary)" }}} className="h-[250px] w-full">
              <BarChart data={safeData.categoryInterest} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                <CartesianGrid horizontal={true} vertical={false} strokeDasharray="3 3" />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis dataKey="category" type="category" tickLine={false} axisLine={false} />
                <ChartTooltip cursor={{ fill: 'var(--color-muted)' }} content={<ChartTooltipContent />} />
                <Bar dataKey="views" fill="var(--color-views)" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Customer Registrations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[150px]">Status</TableHead>
                <TableHead className="w-[150px] text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safeData.recentCustomers.map((customer: any) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                  <TableCell>
                    <Badge variant={customer.status === "Active" ? "default" : "secondary"}>
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{customer.joined}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
