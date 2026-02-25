"use client"

import { useEffect, useState } from "react"
import { DataTable } from "../data-table"
import { notOnboardedColumns } from "./columns"
import { Affiliate } from "../columns"

export default function NotOnboardedAffiliatesPage() {
  const [data, setData] = useState<Affiliate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/admin/partners')
        const allAffiliates = await response.json()
        const notOnboardedAffiliates = allAffiliates.filter((a: Affiliate) => !a.acceptedTerms)
        setData(notOnboardedAffiliates)
      } catch (error) {
        console.error("Failed to fetch not onboarded affiliates", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

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
