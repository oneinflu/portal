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
import { Affiliate } from "@/lib/store"

export default function DashboardPage() {
  const { rate, loading } = useCurrency()
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const [affiliates, setAffiliates] = React.useState<Affiliate[]>([])
  const [stats, setStats] = React.useState({
    totalPartners: 0,
    totalRevenue: 0,
    activeStudents: 0
  })
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const [partnersRes, statsRes] = await Promise.all([
          fetch('/api/admin/partners'),
          fetch('/api/admin/stats')
        ])
        
        const partnersData = await partnersRes.json()
        const statsData = await statsRes.json()
        
        setAffiliates(partnersData)
        setStats(statsData)
      } catch (error) {
        console.error("Failed to fetch admin dashboard data", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter Logic
  const filteredAffiliates = React.useMemo(() => {
    if (!date?.from || !date?.to) return affiliates
    return affiliates.filter((affiliate) => {
      const joinedDate = parseISO(affiliate.joined)
      return isWithinInterval(joinedDate, { start: date.from!, end: date.to! })
    })
  }, [date, affiliates])

  // KPI Calculations based on filtered data
  const totalAffiliates = filteredAffiliates.length
  // For Active Users, we use the global stats if no filter, or approximate
  // But let's just use the stats from API for global view, or keep the mock multiplier logic if per-affiliate data is needed?
  // The API stats.activeStudents is global.
  // Let's use the API stats for global context, but if we filter by date, it's hard to filter "active students" without enrollment data.
  // For now, let's use the API stats for "Active Users Enrolled" but maybe scale it if needed? 
  // Actually, the previous mock was `totalAffiliates * 12`.
  // Let's use stats.activeStudents for the global count.
  const activeUsers = stats.activeStudents 
  
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
      description: "Total active students",
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
