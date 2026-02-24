"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CurrencyDisplay } from "@/components/currency-display"
import { format, parseISO } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Mock data type for enrollments
type Enrollment = {
  id: string
  name: string
  plan: string
  package: string
  amountPaid: number
  commission: number
  payout: number
  date: string
}

export function EnrollmentsModal({ count, affiliateName }: { count: number, affiliateName: string }) {
  // Use state to store enrollments to avoid hydration mismatch with random dates
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])

  useEffect(() => {
    // Generate mock enrollments on client-side only
    const data = Array.from({ length: count }).map((_, i) => ({
      id: `ENR-${i + 1}`,
      name: `User ${i + 1}`,
      plan: i % 2 === 0 ? "Premium" : "Standard",
      package: i % 2 === 0 ? "Annual" : "Monthly",
      amountPaid: i % 2 === 0 ? 500 : 200,
      commission: 10,
      payout: i % 2 === 0 ? 50 : 20,
      date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    }))
    const timer = setTimeout(() => setEnrollments(data), 0)
    return () => clearTimeout(timer)
  }, [count])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          View Enrollments
          <Badge variant="secondary" className="ml-2">
            {count}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enrollments for {affiliateName}</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Name</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Package</TableHead>
              <TableHead className="text-right">Amount Paid</TableHead>
              <TableHead className="text-right">Commission (%)</TableHead>
              <TableHead className="text-right">Payout</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.map((enrollment) => (
              <TableRow key={enrollment.id}>
                <TableCell>{enrollment.name}</TableCell>
                <TableCell>{enrollment.plan}</TableCell>
                <TableCell>{enrollment.package}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <CurrencyDisplay amount={enrollment.amountPaid} align="right" showSubtext={false} />
                  </div>
                </TableCell>
                <TableCell className="text-right">{enrollment.commission}%</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <CurrencyDisplay amount={enrollment.payout} align="right" showSubtext={false} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-medium">{format(parseISO(enrollment.date), "MMM dd, yyyy")}</span>
                    <span className="text-xs text-muted-foreground">{format(parseISO(enrollment.date), "hh:mm a")}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}
