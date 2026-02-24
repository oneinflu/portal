import { DataTable } from "../data-table"
import { activeColumns } from "./columns"
import { Affiliate } from "../columns"

async function getActiveData(): Promise<Affiliate[]> {
  // Mock data for Active Affiliates (all acceptedTerms: true)
  return [
    {
      id: "AFF-001",
      name: "Liam Johnson",
      email: "liam.j@example.com",
      phone: "+91 98765 43210",
      referralCode: "LIAM2023",
      acceptedTerms: true,
      joinedDate: "2023-06-23T10:30:00",
      enrollments: 45,
      payoutBalance: 25000,
      totalPaid: 150000,
    },
    {
      id: "AFF-003",
      name: "Noah Williams",
      email: "noah.williams@example.com",
      phone: "+91 98765 43212",
      referralCode: "NOAH2023",
      acceptedTerms: true,
      joinedDate: "2023-06-25T14:15:00",
      enrollments: 78,
      payoutBalance: 35000,
      totalPaid: 210000,
    },
    {
      id: "AFF-004",
      name: "Emma Brown",
      email: "emma.brown@example.com",
      phone: "+91 98765 43213",
      referralCode: "EMMA2023",
      acceptedTerms: true,
      joinedDate: "2023-06-26T09:45:00",
      enrollments: 110,
      payoutBalance: 45000,
      totalPaid: 320000,
    },
    // Add more mock data for pagination
    ...Array.from({ length: 20 }).map((_, i) => ({
      id: `AFF-00${i + 10}`,
      name: `Active User ${i + 10}`,
      email: `active${i + 10}@example.com`,
      phone: `+91 98765 432${10 + i}`,
      referralCode: `ACTIVE${10 + i}`,
      acceptedTerms: true,
      joinedDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
      enrollments: Math.floor(Math.random() * 100),
      payoutBalance: Math.floor(Math.random() * 50000),
      totalPaid: Math.floor(Math.random() * 200000),
    })),
  ]
}

export default async function ActiveAffiliatesPage() {
  const data = await getActiveData()

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Active Affiliates</h2>
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
        <DataTable columns={activeColumns} data={data} />
      </div>
    </div>
  )
}
