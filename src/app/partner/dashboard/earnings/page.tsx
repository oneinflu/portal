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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Download, Eye, DollarSign, CreditCard, Wallet } from "lucide-react"

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
import { format, parseISO, isWithinInterval, subDays } from "date-fns"
import { CalendarDateRangePicker } from "@/components/date-range-picker"
import { DateRange } from "react-day-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TransactionDetailsModal } from "./transaction-details-modal"

// Transaction Type
export type Transaction = {
  id: string
  transactionDate: string
  amount: number
  currency: string
  paymentMethod: "Bank Transfer" | "PayPal" | "Stripe"
  transactionId: string // External ID (e.g., Stripe ID)
  status: "Completed" | "Processing" | "Failed"
  paymentProofUrl?: string
  enrollmentIds: string[] // IDs of enrollments covered by this payout
}

// Mock Data
const allTransactions: Transaction[] = [
  {
    id: "PAY-001",
    transactionDate: "2026-02-20T10:00:00",
    amount: 500.00,
    currency: "USD",
    paymentMethod: "Bank Transfer",
    transactionId: "BANK_REF_12345",
    status: "Completed",
    paymentProofUrl: "/proofs/pay-001.pdf",
    enrollmentIds: ["ENR-2024-001", "ENR-2024-002"],
  },
  {
    id: "PAY-002",
    transactionDate: "2026-02-15T14:30:00",
    amount: 150.00,
    currency: "USD",
    paymentMethod: "PayPal",
    transactionId: "PP_REF_67890",
    status: "Completed",
    enrollmentIds: ["ENR-2024-005"],
  },
  {
    id: "PAY-003",
    transactionDate: "2026-01-28T09:15:00",
    amount: 240.00,
    currency: "USD",
    paymentMethod: "Stripe",
    transactionId: "ch_1234567890",
    status: "Completed",
    enrollmentIds: ["ENR-2024-003"],
  },
]

export default function EarningsPage() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false)

  // Filter Transactions by Date
  const filteredTransactions = React.useMemo(() => {
    if (!date?.from || !date?.to) return allTransactions
    return allTransactions.filter((transaction) => {
      const transactionDate = parseISO(transaction.transactionDate)
      return isWithinInterval(transactionDate, { start: date.from!, end: date.to! })
    })
  }, [date])

  // KPI Calculations (based on filtered data or lifetime?)
  // Usually KPIs show lifetime unless specified "in this period"
  // Let's do Lifetime for "Lifetime Earnings" and Filtered for others if needed, but typically dashboard summaries are global or filtered.
  // The user asked for "Lifetime Earnings", "Total Received", "Total To Be Received".
  // "Lifetime Earnings" = Total Commission Earned (Paid + Pending)
  // "Total Received" = Total Paid
  // "Total To Be Received" = Total Pending (We need enrollment data for this, but let's mock it or derive from transactions + mock pending)
  
  // For this page, we only have Completed transactions in the table (Payments Received).
  // We can sum up the transactions for "Total Received".
  const totalReceived = allTransactions
    .filter(t => t.status === "Completed")
    .reduce((sum, t) => sum + t.amount, 0)

  // Mocking "To Be Received" since it comes from Enrollments not yet in a Payout Transaction
  const totalToBeReceived = 350.00 
  
  const lifetimeEarnings = totalReceived + totalToBeReceived

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "transactionDate",
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
      cell: ({ row }) => format(parseISO(row.getValue("transactionDate")), "MMM dd, yyyy"),
    },
    {
      accessorKey: "transactionId",
      header: "Transaction ID",
      cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("transactionId")}</div>,
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"))
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: row.original.currency,
        }).format(amount)
        return <div className="text-right font-medium">{formatted}</div>
      },
    },
    {
      accessorKey: "paymentMethod",
      header: "Mode",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.getValue("paymentMethod")}
        </Badge>
      ),
    },
    {
        id: "enrollments",
        header: "Enrollments",
        cell: ({ row }) => (
            <Button 
                variant="link" 
                className="p-0 h-auto font-normal text-blue-600"
                onClick={() => {
                    setSelectedTransaction(row.original)
                    setIsDetailsOpen(true)
                }}
            >
                View {row.original.enrollmentIds.length} Enrollments
            </Button>
        )
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const transaction = row.original
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
                onClick={() => {
                    setSelectedTransaction(transaction)
                    setIsDetailsOpen(true)
                }}
              >
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              {transaction.paymentProofUrl && (
                  <DropdownMenuItem onClick={() => window.open(transaction.paymentProofUrl, '_blank')}>
                    <Download className="mr-2 h-4 w-4" /> Download Proof
                  </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: filteredTransactions,
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
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Earnings & Payouts</h1>
        <div className="flex items-center gap-2">
          <CalendarDateRangePicker date={date} setDate={setDate} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lifetime Earnings
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${lifetimeEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total earnings processed + pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Received
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalReceived.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total amount successfully paid out
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              To Be Received
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${totalToBeReceived.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Pending payouts
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Transaction History</h2>
            <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>

          <div className="rounded-md border bg-card">
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
                    No transactions found in this period.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
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
      
      {selectedTransaction && (
        <TransactionDetailsModal 
            open={isDetailsOpen} 
            onOpenChange={setIsDetailsOpen} 
            transaction={selectedTransaction}
        />
      )}
    </div>
  )
}
