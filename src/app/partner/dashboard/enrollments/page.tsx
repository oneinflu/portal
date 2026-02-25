"use client"

import * as React from "react"
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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"

// Comprehensive Enrollment Data Type
export type Enrollment = {
  id: string
  studentName: string
  studentEmail: string
  studentPhone: string
  enrollmentDate: string
  courseName: string
  packageName: string
  planType: "Monthly" | "Quarterly" | "Annual"
  amountPaid: number
  currency: string
  commissionRate: number
  commissionAmount: number
  paymentStatus: "Paid" | "Pending" | "Refunded"
  paymentMethod: string
  transactionId: string
  payoutStatus: "Paid" | "Pending"
}

// Mock Data
const data: Enrollment[] = [
  {
    id: "ENR-2024-001",
    studentName: "Alice Walker",
    studentEmail: "alice.w@example.com",
    studentPhone: "+1 (555) 123-4567",
    enrollmentDate: "2026-02-23T14:30:00",
    courseName: "Full Stack Development",
    packageName: "Premium Bundle",
    planType: "Annual",
    amountPaid: 1200.00,
    currency: "USD",
    commissionRate: 20,
    commissionAmount: 240.00,
    paymentStatus: "Paid",
    paymentMethod: "Credit Card",
    transactionId: "TXN_123456789",
    payoutStatus: "Pending",
  },
  {
    id: "ENR-2024-002",
    studentName: "Bob Martin",
    studentEmail: "bob.m@example.com",
    studentPhone: "+44 20 7123 4567",
    enrollmentDate: "2026-02-20T09:15:00",
    courseName: "Data Science Fundamentals",
    packageName: "Standard Pack",
    planType: "Monthly",
    amountPaid: 100.00,
    currency: "USD",
    commissionRate: 15,
    commissionAmount: 15.00,
    paymentStatus: "Paid",
    paymentMethod: "PayPal",
    transactionId: "TXN_987654321",
    payoutStatus: "Paid",
  },
  {
    id: "ENR-2024-003",
    studentName: "Charlie Davis",
    studentEmail: "charlie.d@example.com",
    studentPhone: "+61 2 9876 5432",
    enrollmentDate: "2026-02-18T16:45:00",
    courseName: "UI/UX Design Masterclass",
    packageName: "Premium Bundle",
    planType: "Annual",
    amountPaid: 1200.00,
    currency: "USD",
    commissionRate: 20,
    commissionAmount: 240.00,
    paymentStatus: "Paid",
    paymentMethod: "Stripe",
    transactionId: "TXN_456123789",
    payoutStatus: "Pending",
  },
  {
    id: "ENR-2024-004",
    studentName: "Diana Evans",
    studentEmail: "diana.e@example.com",
    studentPhone: "+1 (555) 987-6543",
    enrollmentDate: "2026-02-15T11:20:00",
    courseName: "Digital Marketing 101",
    packageName: "Basic Starter",
    planType: "Monthly",
    amountPaid: 50.00,
    currency: "USD",
    commissionRate: 10,
    commissionAmount: 5.00,
    paymentStatus: "Paid",
    paymentMethod: "Credit Card",
    transactionId: "TXN_789456123",
    payoutStatus: "Paid",
  },
  {
    id: "ENR-2024-005",
    studentName: "Ethan Harris",
    studentEmail: "ethan.h@example.com",
    studentPhone: "+49 30 12345678",
    enrollmentDate: "2026-02-10T10:00:00",
    courseName: "Cybersecurity Basics",
    packageName: "Standard Pack",
    planType: "Annual",
    amountPaid: 1000.00,
    currency: "USD",
    commissionRate: 15,
    commissionAmount: 150.00,
    paymentStatus: "Paid",
    paymentMethod: "Bank Transfer",
    transactionId: "TXN_321654987",
    payoutStatus: "Paid",
  },
]

export const columns: ColumnDef<Enrollment>[] = [
  {
    accessorKey: "studentName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Student Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.getValue("studentName")}</div>
        <div className="text-xs text-muted-foreground">{row.original.studentEmail}</div>
      </div>
    ),
  },
  {
    accessorKey: "enrollmentDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
        const date = parseISO(row.getValue("enrollmentDate"))
        return (
            <div>
                <div>{format(date, "MMM dd, yyyy")}</div>
                <div className="text-xs text-muted-foreground">{format(date, "hh:mm a")}</div>
            </div>
        )
    },
  },
  {
    accessorKey: "courseDetails", // Virtual column for course/package
    header: "Course & Plan",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.courseName}</div>
        <div className="text-xs text-muted-foreground">
          {row.original.packageName} • {row.original.planType}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "amountPaid",
    header: "Amount Paid",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amountPaid"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: row.original.currency,
      }).format(amount)
 
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "commission", // Virtual column for commission details
    header: "Commission",
    cell: ({ row }) => {
        const amount = row.original.commissionAmount
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: row.original.currency,
        }).format(amount)
   
        return (
            <div>
                <div className="font-bold text-green-600">{formatted}</div>
                <div className="text-xs text-muted-foreground">{row.original.commissionRate}% Rate</div>
            </div>
        )
      },
  },
  {
    accessorKey: "payoutStatus",
    header: "Payout Status",
    cell: ({ row }) => {
      const status = row.getValue("payoutStatus") as string
      return (
        <Badge variant={
            status === "Paid" ? "default" : "secondary"
        }>
          {status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const enrollment = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(enrollment.id)}
            >
              Copy Enrollment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Transaction Details</DropdownMenuItem>
            <DropdownMenuItem>Download Invoice</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export default function EnrollmentsPage() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
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
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Enrollments</h1>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by student name..."
          value={(table.getColumn("studentName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("studentName")?.setFilterValue(event.target.value)
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
  )
}
