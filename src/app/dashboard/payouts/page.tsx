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
import { Download } from "lucide-react"
import { EnrollmentsModal } from "@/components/enrollments-modal"
import { PayModal } from "./pay-modal"
import { DateRange } from "react-day-picker"
import { isWithinInterval, parseISO, subDays } from "date-fns"
import { CurrencyDisplay } from "@/components/currency-display"
import { toast } from "sonner"

// Define Payout type
type Payout = {
  id: string
  name: string
  email: string
  phone: string
  enrollmentsCount: number
  totalPayable: number
  status: "pending" | "paid"
  date: string // ISO date string for filtering
}

// Mock data
const initialData: Payout[] = [
  {
    id: "PAY-001",
    name: "Liam Johnson",
    email: "liam.j@example.com",
    phone: "+91 98765 43210",
    enrollmentsCount: 12,
    totalPayable: 75,
    status: "pending",
    date: "2026-02-24",
  },
  {
    id: "PAY-002",
    name: "Noah Williams",
    email: "noah.w@example.com",
    phone: "+91 98765 43212",
    enrollmentsCount: 8,
    totalPayable: 50,
    status: "pending",
    date: "2026-02-20",
  },
  {
    id: "PAY-003",
    name: "Emma Brown",
    email: "emma.b@example.com",
    phone: "+91 98765 43213",
    enrollmentsCount: 25,
    totalPayable: 155,
    status: "pending",
    date: "2026-02-15",
  },
  // Add more mock data
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `PAY-00${i + 4}`,
    name: `Affiliate ${i + 4}`,
    email: `affiliate${i + 4}@example.com`,
    phone: `+91 98765 432${i + 14}`,
    enrollmentsCount: Math.floor(Math.random() * 20) + 1,
    totalPayable: (Math.floor(Math.random() * 20) + 1) * 10,
    status: "pending" as const,
    date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  })),
]

export default function PayoutsPage() {
  const [data, setData] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  async function fetchData() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/payouts')
      const payouts = await response.json()
      // Map API response to Payout type if needed, but it should match
      const formattedPayouts = payouts.map((p: {
        affiliateId: string
        name: string
        email: string
        phone: string
        enrollmentsCount: number
        totalPayable: number
        status: "pending" | "paid"
        date: string
      }) => ({
        id: p.affiliateId,
        name: p.name,
        email: p.email,
        phone: p.phone,
        enrollmentsCount: p.enrollmentsCount,
        totalPayable: p.totalPayable,
        status: p.status,
        date: p.date,
      }))
      setData(formattedPayouts)
    } catch (error) {
      console.error("Failed to fetch payouts", error)
      toast.error("Failed to load payouts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
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

  // Remove paid item from list
  const handlePaymentComplete = (id: string) => {
    setData((prev) => prev.filter((item) => item.id !== id))
  }

  // Download CSV
  const handleDownload = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Enrollments", "Total Payable", "Status", "Date"]
    const csvContent = [
      headers.join(","),
      ...filteredData.map(row => [
        row.id,
        row.name,
        row.email,
        row.phone,
        row.enrollmentsCount,
        row.totalPayable,
        row.status,
        row.date
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "payouts.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Payouts data downloaded successfully")
  }

  const columns: ColumnDef<Payout>[] = [
    {
      accessorKey: "name",
      header: "Affiliate Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "enrollmentsCount",
      header: ({ column }) => {
        return (
          <div className="text-center">
             Enrollments
          </div>
        )
      },
      cell: ({ row }) => {
        return (
          <div className="flex justify-center">
            <EnrollmentsModal 
              count={row.getValue("enrollmentsCount")} 
              affiliateName={row.getValue("name")}
            />
          </div>
        )
      },
    },
    {
      accessorKey: "totalPayable",
      header: () => <div className="text-right">Total Payable</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalPayable"))
        return (
            <div className="flex justify-end">
                <CurrencyDisplay amount={amount} align="right" />
            </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const payout = row.original
        return (
          <div className="text-right">
            <PayModal 
              affiliateId={payout.id}
              affiliateName={payout.name} 
              totalPayable={payout.totalPayable}
              onPaymentComplete={() => {
                handlePaymentComplete(payout.id)
                fetchData() // Refresh data
              }}
            />
          </div>
        )
      },
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

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Payouts</h2>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker date={date} setDate={setDate} />
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center py-4">
          <Input
            placeholder="Filter names..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
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
