"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CurrencyDisplay } from "@/components/currency-display"
import { Affiliate } from "../columns"
import { format, parseISO } from "date-fns"

export const activeColumns: ColumnDef<Affiliate>[] = [
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
    accessorKey: "referralCode",
    header: "Referral Code",
    cell: ({ row }) => {
      const affiliate = row.original
      const handleShare = () => {
        const message = `Hi, ${affiliate.name} , This your referral code ${affiliate.referralCode}. please share while referring to anyone`
        navigator.clipboard.writeText(message)
        toast.success("Message copied to clipboard")
      }

      return (
        <div className="flex items-center gap-2">
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
            {affiliate.referralCode}
          </code>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            <span className="sr-only">Share referral code</span>
          </Button>
        </div>
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
        const date = parseISO(row.getValue("joined"))
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
