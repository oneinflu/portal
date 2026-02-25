"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Transaction } from "./page"
import { format, parseISO } from "date-fns"

interface TransactionDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction
}

// Mock Enrollment Data for Details
const mockEnrollmentDetails = {
    "ENR-2024-001": { name: "Alice Walker", package: "Premium Bundle", amount: 240.00, date: "2026-02-23" },
    "ENR-2024-002": { name: "Bob Martin", package: "Standard Pack", amount: 15.00, date: "2026-02-20" },
    "ENR-2024-003": { name: "Charlie Davis", package: "Premium Bundle", amount: 240.00, date: "2026-02-18" },
    "ENR-2024-005": { name: "Ethan Harris", package: "Standard Pack", amount: 150.00, date: "2026-02-10" },
}

export function TransactionDetailsModal({ open, onOpenChange, transaction }: TransactionDetailsModalProps) {
  
  const enrollments = transaction.enrollmentIds.map(id => ({
      id,
      ...mockEnrollmentDetails[id as keyof typeof mockEnrollmentDetails]
  })).filter(e => e.name) // Filter out undefined if ID not found in mock

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            Details for Transaction ID: <span className="font-mono text-foreground">{transaction.transactionId}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4 text-sm shrink-0">
            <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">{format(parseISO(transaction.transactionDate), "MMM dd, yyyy HH:mm")}</p>
            </div>
            <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-medium text-green-600">${transaction.amount.toFixed(2)}</p>
            </div>
            <div>
                <p className="text-muted-foreground">Payment Method</p>
                <p className="font-medium">{transaction.paymentMethod}</p>
            </div>
            <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant="default">{transaction.status}</Badge>
            </div>
        </div>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <h3 className="font-semibold leading-none tracking-tight shrink-0">Included Enrollments</h3>
            <div className="rounded-md border overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Enrollment ID</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Package</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Commission</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {enrollments.map((enrollment) => (
                            <TableRow key={enrollment.id}>
                                <TableCell className="font-mono text-xs">{enrollment.id}</TableCell>
                                <TableCell>{enrollment.name}</TableCell>
                                <TableCell>{enrollment.package}</TableCell>
                                <TableCell>{format(parseISO(enrollment.date), "MMM dd, yyyy")}</TableCell>
                                <TableCell className="text-right font-medium">${enrollment.amount.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell colSpan={4} className="font-bold text-right">Total</TableCell>
                            <TableCell className="font-bold text-right">${transaction.amount.toFixed(2)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
