"use client"

import { useCurrency } from "@/hooks/use-currency"
import { cn } from "@/lib/utils"

interface CurrencyDisplayProps {
  amount: number
  className?: string
  showSubtext?: boolean
  subtextClassName?: string
  align?: "left" | "right" | "center"
}

export function CurrencyDisplay({ 
  amount, 
  className, 
  showSubtext = true,
  subtextClassName,
  align = "left"
}: CurrencyDisplayProps) {
  const { rate, loading } = useCurrency()

  const formattedUSD = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

  const formattedINR = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount * rate)

  return (
    <div className={cn("flex flex-col", {
      "items-start": align === "left",
      "items-end": align === "right",
      "items-center": align === "center",
    })}>
      <span className={cn("font-bold text-foreground", className)}>
        {formattedUSD}
      </span>
      {showSubtext && (
        <span className={cn("text-xs text-muted-foreground", subtextClassName)}>
          {loading ? "Loading..." : formattedINR}
        </span>
      )}
    </div>
  )
}
