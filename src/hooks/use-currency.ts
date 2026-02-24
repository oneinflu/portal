import { useState, useEffect } from 'react'

const FALLBACK_RATE = 86.50 // Fallback conversion rate

export function useCurrency() {
  const [rate, setRate] = useState<number>(FALLBACK_RATE)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
        if (!response.ok) throw new Error('Failed to fetch rate')
        const data = await response.json()
        if (data.rates && data.rates.INR) {
          setRate(data.rates.INR)
        }
      } catch (error) {
        console.warn('Currency fetch failed, using fallback:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRate()
  }, [])

  return { rate, loading }
}
