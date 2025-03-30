import React from 'react'
import { cn } from '../../lib/utils'

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("bg-gray-50 sticky top-0 z-10", className)}
    {...props}
  />
)) 