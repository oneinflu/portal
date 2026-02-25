/* eslint-disable @typescript-eslint/no-explicit-any */
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

import { Enrollment } from "@/lib/store"

export default function PartnerDashboardPage() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const [stats, setStats] = React.useState({
    lifetimeEarnings: 0,
    totalReceived: 0,
    totalToBeReceived: 0,
  })
  const [enrollments, setEnrollments] = React.useState<Enrollment[]>([])
  const [loading, setLoading] = React.useState(true)


  React.useEffect(() => {

    async function fetchData() {
      try {
        setLoading(true)
        const [statsRes, enrollmentsRes] = await Promise.all([
          fetch('/api/partner/stats'),
          fetch('/api/partner/enrollments')
        ])
        
        const statsData = await statsRes.json()
        const enrollmentsData = await enrollmentsRes.json()
        
        setStats(statsData)
        setEnrollments(enrollmentsData)
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
        toast.error("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Filter Logic
  const filteredEnrollments = React.useMemo(() => {
    if (!date?.from || !date?.to) return enrollments
    return enrollments.filter((enrollment) => {
      const joinedDate = parseISO(enrollment.joined)
      return isWithinInterval(joinedDate, { start: date.from!, end: date.to! })
    })
  }, [date, enrollments])

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
            <CardTitle className="text-sm font-medium">Lifetime Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.lifetimeEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total earnings processed + pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Received</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.totalReceived.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Amount successfully paid out</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">To Be Received</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${stats.totalToBeReceived.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Pending commissions</p>
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
