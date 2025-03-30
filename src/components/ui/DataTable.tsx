<Table>
  <TableHeader>
    {/* ...existing header code... */}
  </TableHeader>
  <TableBody>
    {table.getRowModel().rows.map((row, index) => (
      <TableRow 
        key={row.id}
        data-state={row.getIsSelected() && "selected"}
        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
      >
        {/* ...existing cell code... */}
      </TableRow>
    ))}
  </TableBody>
</Table> 

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  return (
    <>
      {isLoading ? (
        <div className="h-[300px] w-full flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      ) : (
        <div className="rounded-md border">
          {/* Your existing table JSX */}
        </div>
      )}
    </>
  )
} 