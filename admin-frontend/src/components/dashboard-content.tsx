"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts"
import React, { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Package, ShoppingCart, IndianRupee, Trophy, Users, Mail, MousePointerClick, TrendingUp, MoreVertical } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const revenueConfig = {
  revenue: {
    label: "Revenue (₹)",
    color: "var(--color-primary)",
  },
};

const orderStatusConfig = {
  Completed: { label: "Completed", color: "#10b981" }, // Emerald 500
  Pending: { label: "Pending", color: "#f59e0b" },   // Amber 500
  Failed: { label: "Failed", color: "#ef4444" },     // Red 500
};

export function DashboardContent() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateQuery = `?selectedDate=${year}-${month}-${day}`;
    
    fetch(`/api/admin/dashboard/overview${dateQuery}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setData(json.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
        {/* Row 1: Welcome (1), Order Status (1), Stats+Chart (1) */}
        <Skeleton className="col-span-1 h-[250px] rounded-xl" />
        <Skeleton className="col-span-1 h-[250px] rounded-xl" />
        <div className="col-span-1 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-[110px] rounded-xl" />
            <Skeleton className="h-[110px] rounded-xl" />
          </div>
          <Skeleton className="h-[116px] rounded-xl" />
        </div>

        {/* Row 1.5: Sales Analytics (3) */}
        <Skeleton className="col-span-1 md:col-span-2 xl:col-span-3 h-[420px] rounded-xl" />

        {/* Row 2: Weekly Order + Sales Overview (2), Sales Statistics (1) */}
        <Skeleton className="col-span-1 md:col-span-2 h-[350px] rounded-xl" />
        <Skeleton className="col-span-1 h-[350px] rounded-xl" />

        {/* Row 3: Total Users (1), Top Selling (2) */}
        <Skeleton className="col-span-1 md:col-span-3 xl:col-span-1 h-[400px] rounded-xl" />
        <Skeleton className="col-span-1 md:col-span-3 xl:col-span-2 h-[400px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
      {/* Row 1 */}
      {/* Welcome Card */}
      <Card className="col-span-1 overflow-hidden relative bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="z-10 relative">
              <h3 className="text-xl font-bold mb-1 text-primary">Welcome {data.staff.name}!</h3>
              <p className="text-sm text-muted-foreground mb-6">Summary of your store's performance</p>
              
              <h1 className="text-3xl font-extrabold text-primary mb-1">
                ₹{data.totalRevenue.toLocaleString('en-IN')}
              </h1>
              <p className="text-xs text-muted-foreground mb-6">Total Revenue</p>
              
              <Button render={<Link href="/admin/ecommerce/orders" />} nativeButton={false} size="sm">
                View sales
              </Button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-20 dark:opacity-10 pointer-events-none">
              <Trophy className="w-40 h-40 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Status Overview */}
      <Card className="col-span-1 flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Order Status Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer config={orderStatusConfig} className="mx-auto aspect-square max-h-[220px]">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={data.orderStatus}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                strokeWidth={4}
                paddingAngle={4}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 6} className="fill-foreground text-3xl font-bold">
                            {data.totalOrders}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 18} className="fill-muted-foreground text-sm font-medium">
                            Orders
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
              <ChartLegend content={<ChartLegendContent />} className="-translate-y-2 flex-wrap gap-2 [&>*]:justify-center" />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Stats Cards Column */}
      <div className="col-span-1 flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
                <Package className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground">Products</p>
              <h2 className="text-2xl font-bold">{data.totalProducts}</h2>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground">Orders</p>
              <h2 className="text-2xl font-bold">{data.totalOrders}</h2>
            </CardContent>
          </Card>
        </div>
        
        {/* Small Revenue Chart */}
        <Card className="flex-1">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <span className="text-sm font-bold">₹{data.totalRevenue.toLocaleString('en-IN')}</span>
          </CardHeader>
          <CardContent className="p-0 pl-0 mt-2 h-[80px]">
             <ChartContainer config={revenueConfig} className="w-full h-full">
              <AreaChart data={data.revenueChartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillRevenueSmall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="revenue"
                  type="monotone"
                  fill="url(#fillRevenueSmall)"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 1.5 - Sales Analytics */}
      <div className="col-span-1 md:col-span-2 xl:col-span-3 border rounded-xl bg-card text-card-foreground shadow-sm flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Side: Graph */}
        <div className="w-full md:w-2/3 border-b md:border-b-0 md:border-r">
          <Tabs defaultValue="daily" className="w-full">
          <div className="p-6 border-b flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h5 className="font-semibold text-lg">Sales Analytics</h5>
              <p className="text-sm text-muted-foreground">Comprehensive revenue metrics filtered by time period.</p>
            </div>
            <TabsList className="w-full md:w-auto grid grid-cols-3">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="p-6">
            <TabsContent value="daily" className="m-0 h-[300px] w-full">
              <ChartContainer config={revenueConfig} className="h-full w-full aspect-auto">
                <AreaChart data={data.dailyRevenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillRevenueDaily" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                  <Area dataKey="revenue" type="monotone" fill="url(#fillRevenueDaily)" stroke="var(--color-primary)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </TabsContent>
            
            <TabsContent value="monthly" className="m-0 h-[300px] w-full">
              <ChartContainer config={revenueConfig} className="h-full w-full aspect-auto">
                <AreaChart data={data.monthlyRevenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillRevenueMonthly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                  <Area dataKey="revenue" type="monotone" fill="url(#fillRevenueMonthly)" stroke="var(--color-primary)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </TabsContent>

            <TabsContent value="yearly" className="m-0 h-[300px] w-full">
              <ChartContainer config={revenueConfig} className="h-full w-full aspect-auto">
                <AreaChart data={data.yearlyRevenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillRevenueYearly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                  <Area dataKey="revenue" type="monotone" fill="url(#fillRevenueYearly)" stroke="var(--color-primary)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </TabsContent>
          </div>
        </Tabs>
        </div>

        {/* Right Side: Date Picker & Metrics */}
        <div className="w-full md:w-1/3 p-6 flex flex-col bg-muted/20">
          <h5 className="font-semibold text-lg mb-4">Specific Date Sales</h5>
          
          <Popover>
            <PopoverTrigger render={
              <Button variant="outline" className="w-full justify-start text-left font-normal mb-6">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : <span>Pick a date</span>}
              </Button>
            } />
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
              />
            </PopoverContent>
          </Popover>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sales on Selected Date</span>
              <span className="font-bold text-emerald-500">₹{(data.selectedDateRevenue || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Orders on Selected Date</span>
              <span className="font-bold">{(data.selectedDateOrders || 0)}</span>
            </div>
          </div>

          <Separator className="my-2" />

          <h5 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4 mt-4">Lifetime Metrics</h5>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Lifetime Revenue</span>
              <span className="font-bold text-primary">₹{(data.totalRevenue || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Lifetime Orders</span>
              <span className="font-bold">{(data.totalOrders || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Profit</span>
              <span className="font-bold text-emerald-500">₹{(data.totalProfit || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 2 */}
      {/* Weekly Order Summary + Sales Overview */}
      <div className="col-span-1 md:col-span-2 xl:col-span-2 border rounded-xl bg-card text-card-foreground shadow-sm flex flex-col md:flex-row overflow-hidden">
        {/* Weekly Chart */}
        <div className="md:w-2/3 p-6 border-b md:border-b-0 md:border-r flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-semibold">Weekly Order Summary</h5>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
          </div>
          <div className="flex-1 min-h-[250px]">
            <ChartContainer config={revenueConfig} className="h-full w-full aspect-auto">
              <AreaChart data={data.revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <Area
                  dataKey="revenue"
                  type="natural"
                  fill="url(#fillRevenue)"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>
        
        {/* Sales Overview */}
        <div className="md:w-1/3 p-6">
          <h5 className="font-semibold mb-1">Sales Overview</h5>
          <p className="text-sm text-muted-foreground mb-6">
            Performance <span className="text-emerald-500 font-medium">+{data.salesPerformance}%</span> better compared to last month
          </p>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center mb-2">
                <div className="h-8 w-8 rounded bg-primary/10 text-primary flex items-center justify-center mr-3">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground lh-1">Earnings This Month</p>
                  <p className="font-semibold text-sm">₹{data.currentMonthRevenue.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <Progress value={75} className="h-1.5" />
            </div>
            
            <div>
              <div className="flex items-center mb-2">
                <div className="h-8 w-8 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center mr-3">
                  <IndianRupee className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground lh-1">Average Daily Sales</p>
                  <p className="font-semibold text-sm">₹{data.averageDailySales.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <Progress value={65} className="h-1.5 [&_[data-slot=progress-track]]:bg-emerald-500/20 [&_[data-slot=progress-indicator]]:bg-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Statistics */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Sales Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mr-4">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Total Profit</p>
              <p className="text-xs text-muted-foreground">Earnings after cost</p>
            </div>
            <div className="font-semibold">₹{data.totalProfit.toLocaleString('en-IN')}</div>
          </div>
          
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4">
              <Package className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Total Products</p>
              <p className="text-xs text-muted-foreground">Active in store</p>
            </div>
            <div className="font-semibold">{data.totalProducts}</div>
          </div>
          
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center mr-4">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Total Orders</p>
              <p className="text-xs text-muted-foreground">Lifetime orders</p>
            </div>
            <div className="font-semibold">{data.totalOrders}</div>
          </div>
          
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mr-4">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Total Revenue</p>
              <p className="text-xs text-muted-foreground">Lifetime earnings</p>
            </div>
            <div className="font-semibold">₹{data.totalRevenue.toLocaleString('en-IN')}</div>
          </div>
        </CardContent>
      </Card>

      {/* Row 3 */}
      {/* Registered Users */}
      <Card className="col-span-1 md:col-span-3 xl:col-span-1">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Total Registered Users</CardTitle>
          <div className="text-3xl font-normal mt-2">{data.totalCustomers.toLocaleString()}</div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">User Interaction Summary</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
                <span className="text-sm">Newsletter Subscribers</span>
              </div>
              <span className="text-sm font-medium">{data.totalNewsletter.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
                <span className="text-sm">Unique Visitors</span>
              </div>
              <span className="text-sm font-medium">{data.totalUniqueVisitors.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-primary mr-2"></span>
                <span className="text-sm">Active Orders</span>
              </div>
              <span className="text-sm font-medium">{data.totalOrders.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-cyan-500 mr-2"></span>
                <span className="text-sm">Store Products</span>
              </div>
              <span className="text-sm font-medium">{data.totalProducts.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Selling Products */}
      <Card className="col-span-1 md:col-span-3 xl:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Top Selling Products</CardTitle>
          <Button variant="outline" size="sm">View All</Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Total Sold</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topProducts.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center mr-3">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.brand}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>₹{product.price}</TableCell>
                  <TableCell className="font-medium">{product.sold} sold</TableCell>
                  <TableCell>
                    <Badge variant={product.status === "Active" ? "default" : "secondary"} className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none">
                      {product.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
