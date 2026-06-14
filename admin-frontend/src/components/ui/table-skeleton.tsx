import React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { TableRow, TableCell } from "@/components/ui/table"

export function TableSkeleton({ columns = 4, rows = 5 }: { columns?: number, rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton className="h-5 w-full max-w-[200px]" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
