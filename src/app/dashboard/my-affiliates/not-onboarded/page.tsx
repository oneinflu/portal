import { DataTable } from "../data-table"
import { notOnboardedColumns } from "./columns"
import { Affiliate } from "../columns"

async function getNotOnboardedData(): Promise<Affiliate[]> {
  // Mock data for Not Yet Onboarded Affiliates (acceptedTerms: false)
  return [
    {
      id: "AFF-002",
      name: "Olivia Smith",
      email: "olivia.smith@example.com",
      phone: "+91 98765 43211",
      referralCode: "",
      acceptedTerms: false,
      joinedDate: "2023-06-24",
      enrollments: 0,
      payoutBalance: 0,
      totalPaid: 0,
    },
    {
      id: "AFF-005",
      name: "James Jones",
      email: "james.jones@example.com",
      phone: "+91 98765 43214",
      referralCode: "",
      acceptedTerms: false,
      joinedDate: "2023-06-27",
      enrollments: 0,
      payoutBalance: 0,
      totalPaid: 0,
    },
    // Add more mock data for pagination
    ...Array.from({ length: 20 }).map((_, i) => ({
      id: `AFF-PEND-${i + 10}`,
      name: `Pending User ${i + 10}`,
      email: `pending${i + 10}@example.com`,
      phone: `+91 98765 432${10 + i}`,
      referralCode: "",
      acceptedTerms: false,
      joinedDate: "2023-07-02",
      enrollments: 0,
      payoutBalance: 0,
      totalPaid: 0,
    })),
  ]
}

export default async function NotOnboardedAffiliatesPage() {
  const data = await getNotOnboardedData()

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Not Yet Onboarded</h2>
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
        <DataTable columns={notOnboardedColumns} data={data} />
      </div>
    </div>
  )
}
