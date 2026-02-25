/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useMemo, useEffect } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
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
import { CalendarDateRangePicker } from "@/components/date-range-picker"
import { Download, FileText } from "lucide-react"
import { EnrollmentsModal } from "@/components/enrollments-modal"
import { DateRange } from "react-day-picker"
import { isWithinInterval, parseISO, subDays, format } from "date-fns"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CurrencyDisplay } from "@/components/currency-display"

// Define Transaction type
type Transaction = {
  id: string
  date: string
  affiliateName: string
  email: string
  amount: number
  paymentMode: string
  enrollmentsCount: number
  proofUrl: string
  status: "Success" | "Processing" | "Failed"
}

export default function TransactionsPage() {
  const [data, setData] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/admin/transactions')
        const transactions = await response.json()
        setData(transactions)
      } catch (error) {
        console.error("Failed to fetch transactions", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter Logic
  const filteredData = useMemo(() => {
    if (!date?.from || !date?.to) return data
    return data.filter((item) => {
      const itemDate = parseISO(item.date)
      return isWithinInterval(itemDate, { start: date.from!, end: date.to! })
    })
  }, [date, data])

  // Download CSV
  const handleDownload = () => {
    const headers = ["Transaction ID", "Date", "Affiliate Name", "Email", "Amount", "Payment Mode", "Enrollments", "Status"]
    const csvContent = [
      headers.join(","),
      ...filteredData.map(row => [
        row.id,
        row.date,
        row.affiliateName,
        row.email,
        row.amount,
        row.paymentMode,
        row.enrollmentsCount,
        row.status
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `transactions-${format(new Date(), "yyyy-MM-dd")}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Transaction report downloaded successfully")
  }

  const handleViewProof = (id: string) => {
    toast.info(`Opening proof of payment for ${id}...`)
    // In a real app, this would open a modal or new tab with the proof image/pdf
    setTimeout(() => {
        window.open("https://placehold.co/600x400?text=Payment+Proof", "_blank")
    }, 500)
  }

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => format(parseISO(row.getValue("date")), "MMM dd, yyyy"),
    },
    {
      accessorKey: "id",
      header: "Transaction ID",
      cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("id")}</span>,
    },
    {
      accessorKey: "affiliateName",
      header: "Affiliate",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("affiliateName")}</div>
          <div className="text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"))
        return <div className="flex justify-end"><CurrencyDisplay amount={amount} align="right" /></div>
      },
    },
    {
      accessorKey: "paymentMode",
      header: "Mode",
      cell: ({ row }) => <Badge variant="outline">{row.getValue("paymentMode")}</Badge>,
    },
    {
      accessorKey: "enrollmentsCount",
      header: "Enrollments",
      cell: ({ row }) => (
        <EnrollmentsModal 
          count={row.getValue("enrollmentsCount")} 
          affiliateName={row.getValue("affiliateName")}
        />
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge variant={status === "Success" ? "default" : status === "Processing" ? "secondary" : "destructive"}>
            {status}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: "Proof",
      cell: ({ row }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => handleViewProof(row.original.id)}
              >
                <span className="sr-only">View proof</span>
                <FileText className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Payment Proof</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
  ]

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

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker date={date} setDate={setDate} />
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center py-4">
          <Input
            placeholder="Filter by affiliate name..."
            value={(table.getColumn("affiliateName")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("affiliateName")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
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
