import React from 'react'
import { cn } from '../../lib/utils'

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-3 align-middle border-r last:border-r-0 border-gray-100 [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
)) 