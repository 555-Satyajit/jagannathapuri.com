"use client"

import * as React from "react"
import { 
  MoreVertical, Search, Eye, 
  ArrowRightLeft, IndianRupee, CheckCircle2, AlertCircle, 
  CreditCard, Landmark, Download, ShieldCheck
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import { useEffect, useState } from "react"

interface Transaction {
  id: number
  transaction_id: string
  customer_id: number
  customer_name: string
  customer_email: string
  amount: number
  date: string
  payment_method: string
  payment_last4: string | null
  status: string
}

export function TransactionsContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await fetch('/api/admin/transactions/data')
        const json = await res.json()
        if (json.data) {
          setTransactions(json.data)
        }
      } catch (err) {
        console.error("Failed to fetch transactions:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [])

  const totalTransactions = transactions.length
  const totalAmount = transactions.reduce((sum, trx) => sum + trx.amount, 0)
  const successfulCount = transactions.filter(trx => trx.status === "Success" || trx.status === "Paid" || trx.status === "Successful").length
  const failedCount = transactions.length - successfulCount

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(totalTransactions / itemsPerPage))
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Transactions</h2>
          <p className="text-muted-foreground">
            Monitor and manage all financial transactions and payment statuses.
          </p>
        </div>
        <Button variant="outline" className="shrink-0">
          <Download className="mr-2 h-4 w-4" /> Download Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Transactions</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{totalTransactions.toLocaleString()}</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Lifetime payments</p>
            </div>
            <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <ArrowRightLeft className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Amount</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h3>
              </div>
              <p className="text-xs text-emerald-500 font-medium mt-1">Lifetime revenue</p>
            </div>
            <div className="h-12 w-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
              <IndianRupee className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Successful</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{successfulCount.toLocaleString()}</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">~{totalTransactions > 0 ? Math.round((successfulCount/totalTransactions)*100) : 0}% success rate</p>
            </div>
            <div className="h-12 w-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Failed/Pending</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{failedCount.toLocaleString()}</h3>
              </div>
              <p className="text-xs text-rose-500 font-medium mt-1">Needs attention</p>
            </div>
            <div className="h-12 w-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center p-4 border-b gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search by Transaction ID, Customer, Ref..." 
              className="pl-9 w-full bg-background"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 whitespace-nowrap">
                <TableHead>Transaction #ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map((trx) => {
                  const avatar = trx.customer_name ? trx.customer_name.substring(0, 2).toUpperCase() : "U";
                  const isSuccess = trx.status === "Success" || trx.status === "Paid" || trx.status === "Successful";
                  const isPending = trx.status === "Pending";
                  
                  return (
                    <TableRow key={trx.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-mono font-medium">{trx.transaction_id || `#TRX-${trx.id}`}</span>
                          <span className="text-xs text-muted-foreground">Ref: {trx.payment_last4 ? `**${trx.payment_last4}` : 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border">
                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-medium">{avatar}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{trx.customer_name || 'Unknown'}</span>
                            <span className="text-xs text-muted-foreground">{trx.customer_email || 'N/A'}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-primary">₹{trx.amount.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {new Date(trx.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {trx.payment_method === "UPI" && <ArrowRightLeft className="h-4 w-4" />}
                          {trx.payment_method === "Credit Card" && <CreditCard className="h-4 w-4" />}
                          {trx.payment_method === "Net Banking" && <Landmark className="h-4 w-4" />}
                          {trx.payment_method === "Wallet" && <ShieldCheck className="h-4 w-4" />}
                          {trx.payment_method || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isSuccess ? "default" : isPending ? "outline" : "destructive"} 
                               className={isSuccess ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20" : ""}>
                          {trx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" /> View Receipt
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => window.open(`/admin/ecommerce/orders/invoice/${trx.id}`, '_blank')}>
                          <Download className="mr-2 h-4 w-4" /> Download Invoice
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer">
                          <AlertCircle className="mr-2 h-4 w-4" /> Report Issue
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {totalTransactions === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, totalTransactions)} of {totalTransactions} transactions
          </div>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Simple logic to show limited pages
                if (
                  pageNum === 1 || 
                  pageNum === totalPages || 
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink 
                        href="#" 
                        isActive={currentPage === pageNum}
                        onClick={(e) => { e.preventDefault(); handlePageChange(pageNum); }}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                } else if (
                  pageNum === currentPage - 2 || 
                  pageNum === currentPage + 2
                ) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}
