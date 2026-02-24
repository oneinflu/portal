"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CurrencyDisplay } from "@/components/currency-display"
import { format, parseISO } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// This type is used to define the shape of our data.
export type Enrollment = {
  id: string
  affiliateName: string
  affiliateId: string
  studentName: string
  course: string
  package: string
  plan: string
  amountPaid: number
  commissionRate: number
  payoutAmount: number
  netRevenue: number
  isPaidToAffiliate: boolean
  enrollmentDate: string // ISO string
}

export const columns: ColumnDef<Enrollment>[] = [
  {
    accessorKey: "enrollmentDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date & Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = parseISO(row.getValue("enrollmentDate"))
      return (
        <div className="flex flex-col">
          <span className="font-medium">{format(date, "MMM dd, yyyy")}</span>
          <span className="text-xs text-muted-foreground">{format(date, "hh:mm a")}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "affiliateName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Referred By
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.getValue("affiliateName")}</span>
        <span className="text-xs text-muted-foreground">ID: {row.original.affiliateId}</span>
      </div>
    ),
  },
  {
    accessorKey: "studentName",
    header: "Student",
  },
  {
    accessorKey: "course",
    header: "Course Details",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <span className="font-medium">{row.getValue("course")}</span>
        <div className="flex gap-1">
          <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">{row.original.package}</Badge>
          <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5">{row.original.plan}</Badge>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "amountPaid",
    header: () => <div className="text-right">Amount Paid</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amountPaid"))
      return <div className="flex justify-end"><CurrencyDisplay amount={amount} align="right" showSubtext={false} /></div>
    },
  },
  {
    accessorKey: "commissionRate",
    header: () => <div className="text-right">Comm. %</div>,
    cell: ({ row }) => <div className="text-right">{row.getValue("commissionRate")}%</div>,
  },
  {
    accessorKey: "payoutAmount",
    header: () => <div className="text-right">Payout</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("payoutAmount"))
      return <div className="flex justify-end"><CurrencyDisplay amount={amount} align="right" showSubtext={false} /></div>
    },
  },
  {
    accessorKey: "netRevenue",
    header: () => <div className="text-right">Net Revenue</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("netRevenue"))
      return <div className="flex justify-end"><CurrencyDisplay amount={amount} align="right" showSubtext={false} /></div>
    },
  },
  {
    accessorKey: "isPaidToAffiliate",
    header: "Status",
    cell: ({ row }) => {
      const isPaid = row.getValue("isPaidToAffiliate") as boolean
      return (
        <Badge variant={isPaid ? "default" : "destructive"}>
          {isPaid ? "Paid" : "Pending"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
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
            <DropdownMenuItem>View Affiliate Details</DropdownMenuItem>
            <DropdownMenuItem>View Payment Receipt</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
