"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, CreditCard, DollarSign, Copy, Ticket } from "lucide-react"
import { CalendarDateRangePicker } from "@/components/date-range-picker"
import { DateRange } from "react-day-picker"
import { isWithinInterval, parseISO, subDays, format } from "date-fns"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function PartnerDashboardPage() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  // Mock Data for Recent Enrollments
  const allEnrollments = [
    {
      id: "ENR-001",
      name: "Alice Walker",
      email: "alice.w@example.com",
      joined: "2026-02-23",
      package: "Premium Bundle",
      plan: "Annual",
      commissionRate: 20,
      paidAmount: 1200,
      commission: 240,
    },
    {
      id: "ENR-002",
      name: "Bob Martin",
      email: "bob.m@example.com",
      joined: "2026-02-20",
      package: "Standard Pack",
      plan: "Monthly",
      commissionRate: 15,
      paidAmount: 100,
      commission: 15,
    },
    {
      id: "ENR-003",
      name: "Charlie Davis",
      email: "charlie.d@example.com",
      joined: "2026-02-18",
      package: "Premium Bundle",
      plan: "Annual",
      commissionRate: 20,
      paidAmount: 1200,
      commission: 240,
    },
    {
      id: "ENR-004",
      name: "Diana Evans",
      email: "diana.e@example.com",
      joined: "2026-02-15",
      package: "Basic Starter",
      plan: "Monthly",
      commissionRate: 10,
      paidAmount: 50,
      commission: 5,
    },
    {
      id: "ENR-005",
      name: "Ethan Harris",
      email: "ethan.h@example.com",
      joined: "2026-02-10",
      package: "Standard Pack",
      plan: "Annual",
      commissionRate: 15,
      paidAmount: 1000,
      commission: 150,
    },
  ]

  // Filter Logic
  const filteredEnrollments = React.useMemo(() => {
    if (!date?.from || !date?.to) return allEnrollments
    return allEnrollments.filter((enrollment) => {
      const joinedDate = parseISO(enrollment.joined)
      return isWithinInterval(joinedDate, { start: date.from!, end: date.to! })
    })
  }, [date, allEnrollments])

  // KPI Calculations
  const totalEnrollments = filteredEnrollments.length
  const totalCommissionEarned = filteredEnrollments.reduce((acc, curr) => acc + curr.commission, 0)
  // Mocking "To be received" as 20% of total earned for demonstration, or could be a separate field in real data
  const totalCommissionToBeReceived = totalCommissionEarned * 0.2 
  const totalPaymentReceived = totalCommissionEarned - totalCommissionToBeReceived

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <CalendarDateRangePicker date={date} setDate={setDate} />
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
            <h3 className="font-semibold flex items-center gap-2">
                <Ticket className="h-4 w-4 text-primary" />
                Your Referral Code
            </h3>
            <p className="text-sm text-muted-foreground">
                Share this code with students to earn <span className="font-medium text-foreground">15% commission</span> on every enrollment.
            </p>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 border rounded-md p-1.5 pl-4">
            <code className="text-lg font-mono font-bold tracking-wider text-primary">
                PARTNER2024
            </code>
            <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 hover:bg-background shadow-sm"
                onClick={() => {
                    navigator.clipboard.writeText("PARTNER2024")
                    toast.success("Referral code copied!")
                }}
            >
                <Copy className="h-4 w-4 mr-2" />
                Copy
            </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Enrollments
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              Students enrolled via your link
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Payment Received
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPaymentReceived.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Commission already paid out
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Payment Pending
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCommissionToBeReceived.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Commission to be received
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enrollments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Paid Amount</TableHead>
                <TableHead>Comm. Rate</TableHead>
                <TableHead className="text-right">Commission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnrollments.length > 0 ? (
                filteredEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      <div className="font-medium">{enrollment.name}</div>
                      <div className="text-xs text-muted-foreground">{enrollment.email}</div>
                    </TableCell>
                    <TableCell>
                      {format(parseISO(enrollment.joined), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>{enrollment.package}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{enrollment.plan}</Badge>
                    </TableCell>
                    <TableCell>${enrollment.paidAmount}</TableCell>
                    <TableCell>{enrollment.commissionRate}%</TableCell>
                    <TableCell className="text-right font-bold">
                      ${enrollment.commission}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No enrollments found for the selected period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
