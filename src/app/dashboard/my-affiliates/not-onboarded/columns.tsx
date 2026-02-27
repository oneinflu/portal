
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, MoreHorizontal, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Affiliate } from "../columns"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"

const ActionCell = ({ affiliate }: { affiliate: Affiliate }) => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleActivate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: affiliate.id, status: 'Accepted' }),
      })

      if (!res.ok) throw new Error("Failed to activate")

      toast.success("Affiliate activated successfully")
      window.location.reload()
    } catch (error) {
      toast.error("Failed to activate affiliate")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button 
        size="sm" 
        onClick={handleActivate} 
        disabled={loading}
        className="h-8"
      >
        {loading ? "Activating..." : (
            <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Activate
            </>
        )}
      </Button>
      
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
                navigator.clipboard.writeText(affiliate.id)
                toast.success("ID copied to clipboard")
            }}
          >
            Copy Affiliate ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Send Reminder</DropdownMenuItem>
          <DropdownMenuItem>View details</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export const notOnboardedColumns: ColumnDef<Affiliate>[] = [
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
    id: "actions",
    cell: ({ row }) => <ActionCell affiliate={row.original} />,
  },
]
