import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { TableSkeleton } from "@/components/ui/table-skeleton"

export interface ColumnDef<T> {
  header: React.ReactNode
  accessorKey?: keyof T
  cell?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  keyExtractor: (item: T) => string | number
  
  // Pagination details
  totalItems?: number
  currentPage?: number
  itemsPerPage?: number
  isLoading?: boolean
}

export function DataTable<T>({ 
  columns, 
  data, 
  keyExtractor,
  totalItems,
  itemsPerPage = 10,
  isLoading = false
}: DataTableProps<T>) {
  const [internalPage, setInternalPage] = React.useState(1)
  
  const isServerSide = totalItems !== undefined
  const actualTotal = totalItems ?? data.length
  const totalPages = Math.max(1, Math.ceil(actualTotal / itemsPerPage))
  
  const currentPage = Math.min(internalPage, totalPages)
  
  const startItem = actualTotal === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, actualTotal)

  const currentData = isServerSide 
    ? data 
    : data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handlePageChange = (page: number, e: React.MouseEvent) => {
    e.preventDefault()
    if (page >= 1 && page <= totalPages) {
      setInternalPage(page)
    }
  }

  return (
    <div>
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            {columns.map((col, index) => (
              <TableHead key={index} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeleton columns={columns.length} rows={Math.max(3, itemsPerPage)} />
          ) : currentData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results found.
              </TableCell>
            </TableRow>
          ) : (
            currentData.map((item) => (
              <TableRow key={keyExtractor(item)}>
                {columns.map((col, colIndex) => (
                  <TableCell key={colIndex} className={col.className}>
                    {col.cell 
                      ? col.cell(item) 
                      : col.accessorKey 
                        ? (item[col.accessorKey] as React.ReactNode)
                        : null}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {actualTotal > 0 && (
        <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>
            Showing {startItem}-{endItem} of {actualTotal} items
          </div>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => handlePageChange(currentPage - 1, e)} 
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {/* Show simple pagination pages for now */}
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                // Simple logic to show a few pages around current page
                if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink 
                        href="#" 
                        isActive={currentPage === page}
                        onClick={(e) => handlePageChange(page, e)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                }
                // Show ellipsis
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return <PaginationItem key={page}><span className="px-2">...</span></PaginationItem>
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => handlePageChange(currentPage + 1, e)}
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
