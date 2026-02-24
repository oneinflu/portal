"use client"

import { useState, useMemo } from "react"
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CalendarDateRangePicker } from "@/components/date-range-picker"
import { DateRange } from "react-day-picker"
import { isWithinInterval, parseISO, subDays, format } from "date-fns"
import { Download, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { columns, Enrollment } from "./columns"

// Mock Data Generation
const generateMockData = (count: number): Enrollment[] => {
  const courses = ["Full Stack Web Dev", "Data Science", "UI/UX Design", "Digital Marketing"]
  const plans = ["Premium", "Standard", "Basic"]
  const packages = ["Annual", "Monthly", "Quarterly"]
  
  return Array.from({ length: count }).map((_, i) => {
    const amountPaid = (Math.floor(Math.random() * 20) + 5) * 50 // $250 - $1250
    const commissionRate = Math.floor(Math.random() * 15) + 5 // 5% - 20%
    const payoutAmount = (amountPaid * commissionRate) / 100
    const netRevenue = amountPaid - payoutAmount
    const isPaid = Math.random() > 0.3
    
    // Generate random date within last 60 days
    const date = new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000)
    // Add random time
    date.setHours(Math.floor(Math.random() * 24))
    date.setMinutes(Math.floor(Math.random() * 60))

    return {
      id: `ENR-${1000 + i}`,
      affiliateName: `Affiliate ${Math.floor(Math.random() * 20) + 1}`,
      affiliateId: `AFF-${100 + Math.floor(Math.random() * 20) + 1}`,
      studentName: `Student ${i + 1}`,
      course: courses[Math.floor(Math.random() * courses.length)],
      package: packages[Math.floor(Math.random() * packages.length)],
      plan: plans[Math.floor(Math.random() * plans.length)],
      amountPaid,
      commissionRate,
      payoutAmount,
      netRevenue,
      isPaidToAffiliate: isPaid,
      enrollmentDate: date.toISOString(),
    }
  })
}

export default function EnrollmentsPage() {
  const [data] = useState<Enrollment[]>(generateMockData(100))
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  // Filter Logic
  const filteredData = useMemo(() => {
    if (!date?.from || !date?.to) return data
    return data.filter((item) => {
      const itemDate = parseISO(item.enrollmentDate)
      return isWithinInterval(itemDate, { start: date.from!, end: date.to! })
    })
  }, [date, data])

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const downloadCSV = () => {
    const headers = [
      "ID", "Date", "Affiliate", "Student", "Course", "Package", 
      "Amount Paid", "Commission %", "Payout", "Net Revenue", "Status"
    ]
    
    const rows = filteredData.map(row => [
      row.id,
      format(parseISO(row.enrollmentDate), "yyyy-MM-dd HH:mm:ss"),
      row.affiliateName,
      row.studentName,
      row.course,
      row.package,
      row.amountPaid,
      row.commissionRate,
      row.payoutAmount,
      row.netRevenue,
      row.isPaidToAffiliate ? "Paid" : "Pending"
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `enrollments-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Enrollments report downloaded successfully")
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Enrollments</h2>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker date={date} setDate={setDate} />
          <Button onClick={downloadCSV} variant="outline" size="sm" className="h-8 gap-1">
            <Download className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
        </div>
      </div>
      
      <div className="w-full">
        <div className="flex items-center py-4 justify-between">
          <Input
            placeholder="Filter by affiliate..."
            value={(table.getColumn("affiliateName")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("affiliateName")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
