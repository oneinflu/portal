"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { CurrencyDisplay } from "@/components/currency-display"
import { format, parseISO } from "date-fns"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Affiliate = {
  id: string
  name: string
  email: string
  phone: string
  referralCode: string
  acceptedTerms: boolean
  joined: string
  enrollments: number
  payoutBalance: number
  totalPaid: number
}

export const columns: ColumnDef<Affiliate>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
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
    accessorKey: "acceptedTerms",
    header: "Accepted Terms",
    cell: ({ row }) => {
      const accepted = row.getValue("acceptedTerms") as boolean
      return (
        <Badge variant={accepted ? "default" : "destructive"}>
          {accepted ? "Yes" : "No"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "joined",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Joined
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    cell: ({ row }) => {
        const dateStr = row.getValue("joined") as string
        let date
        try {
            date = parseISO(dateStr)
        } catch (e) {
            return <span>{dateStr}</span>
        }
        return (
          <div className="text-center flex flex-col">
            <span className="font-medium">{format(date, "MMM dd, yyyy")}</span>
            <span className="text-xs text-muted-foreground">{format(date, "hh:mm a")}</span>
          </div>
        )
    }
  },
  {
    accessorKey: "enrollments",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Enrollments
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    cell: ({ row }) => <div className="text-center">{row.getValue("enrollments")}</div>,
  },
  {
    accessorKey: "payoutBalance",
    header: () => <div className="text-right">Payout Balance</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("payoutBalance"))
      return <div className="flex justify-end"><CurrencyDisplay amount={amount} align="right" /></div>
    },
  },
  {
    accessorKey: "totalPaid",
    header: () => <div className="text-right">Total Paid</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalPaid"))
      return <div className="flex justify-end"><CurrencyDisplay amount={amount} align="right" /></div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const affiliate = row.original
 
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
              onClick={() => navigator.clipboard.writeText(affiliate.id)}
            >
              Copy Affiliate ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>View payment history</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
