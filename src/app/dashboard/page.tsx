"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
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
import { Users, UserCheck, Activity, DollarSign } from "lucide-react"
import { CalendarDateRangePicker } from "@/components/date-range-picker"
import { DateRange } from "react-day-picker"
import { isWithinInterval, parseISO, subDays } from "date-fns"
import { CurrencyDisplay } from "@/components/currency-display"
import { useCurrency } from "@/hooks/use-currency"

export default function DashboardPage() {
  const { rate, loading } = useCurrency()
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  // Mock Data for Recent Affiliates with dates for filtering
  // Using dates relative to "Today" (2026-02-24) to ensure data shows up
  const allAffiliates = [
    {
      id: "AFF-001",
      name: "Liam Johnson",
      email: "liam.j@example.com",
      status: "Accepted",
      joined: "2026-02-23", // Yesterday
      amount: 300,
    },
    {
      id: "AFF-002",
      name: "Olivia Smith",
      email: "olivia.smith@example.com",
      status: "Pending",
      joined: "2026-02-20",
      amount: 180,
    },
    {
      id: "AFF-003",
      name: "Noah Williams",
      email: "noah.williams@example.com",
      status: "Accepted",
      joined: "2026-02-15",
      amount: 420,
    },
    {
      id: "AFF-004",
      name: "Emma Brown",
      email: "emma.brown@example.com",
      status: "Accepted",
      joined: "2026-01-28", // Last month
      amount: 550,
    },
    {
      id: "AFF-005",
      name: "James Jones",
      email: "james.jones@example.com",
      status: "Pending",
      joined: "2026-02-10",
      amount: 0,
    },
    {
      id: "AFF-006",
      name: "Sophia Garcia",
      email: "sophia.g@example.com",
      status: "Accepted",
      joined: "2026-02-24", // Today
      amount: 145,
    },
    {
        id: "AFF-007",
        name: "Lucas Miller",
        email: "lucas.m@example.com",
        status: "Pending",
        joined: "2025-12-15", // Old
        amount: 60,
    }
  ]

  // Filter Logic
  const filteredAffiliates = React.useMemo(() => {
    if (!date?.from || !date?.to) return allAffiliates
    return allAffiliates.filter((affiliate) => {
      const joinedDate = parseISO(affiliate.joined)
      return isWithinInterval(joinedDate, { start: date.from!, end: date.to! })
    })
  }, [date, allAffiliates])

  // KPI Calculations based on filtered data
  const totalAffiliates = filteredAffiliates.length
  const activeUsers = totalAffiliates * 12 // Mock multiplier
  const pendingPayouts = filteredAffiliates
    .filter(a => a.status === "Pending")
    .reduce((acc, curr) => acc + curr.amount, 0)
  const totalPaid = filteredAffiliates
    .filter(a => a.status === "Accepted")
    .reduce((acc, curr) => acc + curr.amount, 0)

  const kpiData = [
    {
      title: "Total Affiliates",
      value: totalAffiliates.toLocaleString(),
      description: "In selected period",
      icon: Users,
    },
    {
      title: "Active Users Enrolled",
      value: activeUsers.toLocaleString(),
      description: "Estimated based on affiliates",
      icon: UserCheck,
    },
    {
      title: "Pending Payouts",
      value: <CurrencyDisplay amount={pendingPayouts} />,
      description: "Requires approval",
      icon: Activity,
    },
    {
      title: "Total Paid",
      value: <CurrencyDisplay amount={totalPaid} />,
      description: "Successfully processed",
      icon: DollarSign,
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="default" className="h-9 px-3 py-1 text-sm font-medium">
             {loading ? "Loading Rate..." : `1 USD = ₹${rate.toFixed(2)}`}
          </Badge>
          <CalendarDateRangePicker date={date} setDate={setDate} />
        </div>
      </div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" >
         <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Affiliates</CardTitle>
              <CardDescription>
                Recent affiliates who have joined the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAffiliates.length > 0 ? (
                    filteredAffiliates.map((affiliate) => (
                      <TableRow key={affiliate.id}>
                        <TableCell className="font-medium">{affiliate.id}</TableCell>
                        <TableCell>{affiliate.name}</TableCell>
                        <TableCell>{affiliate.email}</TableCell>
                        <TableCell>
                          <Badge variant={affiliate.status === "Accepted" ? "default" : "outline"}>
                              {affiliate.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{affiliate.joined}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No results found for the selected period.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      </div>
    </div>
  )
}
