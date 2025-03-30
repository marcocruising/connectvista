import React from 'react'
import { cn } from '../../lib/utils'

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-blue-50 data-[state=selected]:bg-blue-100",
      className
    )}
    {...props}
  />
)) 