"use client"

import { useState } from "react"
import Lottie from "lottie-react"
import sentAnimation from "@/assets/sent.json"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CurrencyDisplay } from "@/components/currency-display"
import { toast } from "sonner"

interface PayModalProps {
  affiliateName: string
  totalPayable: number
  onPaymentComplete: () => void
}

export function PayModal({ affiliateName, totalPayable, onPaymentComplete }: PayModalProps) {
  const [open, setOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    setIsLoading(false)
    setIsSuccess(true)
    
    // Show success message after animation plays a bit
    setTimeout(() => {
      toast.success(`Payment to ${affiliateName} processed successfully!`)
      setOpen(false)
      setIsSuccess(false) // Reset for next time
      onPaymentComplete()
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Pay Now</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center p-6">
            <div className="w-48 h-48">
              <Lottie animationData={sentAnimation} loop={false} autoplay={true} />
            </div>
            <h3 className="text-xl font-semibold text-center mt-4">Payment Sent!</h3>
            <p className="text-center text-muted-foreground mt-2">
              Partner has been informed about the payment.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Process Payout</DialogTitle>
              <DialogDescription asChild>
                <div className="flex flex-col gap-2 pt-2">
                    <span>Make a payment to <span className="font-semibold text-foreground">{affiliateName}</span>:</span>
                    <div className="flex justify-center p-4 bg-muted/50 rounded-lg">
                        <CurrencyDisplay amount={totalPayable} align="center" className="text-2xl" />
                    </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment-date" className="text-right">
                  Date
                </Label>
                <Input
                  id="payment-date"
                  type="date"
                  required
                  className="col-span-3"
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="transaction-id" className="text-right">
                  Txn ID
                </Label>
                <Input
                  id="transaction-id"
                  placeholder="TRX123456789"
                  required
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment-mode" className="text-right">
                  Mode
                </Label>
                <Select required defaultValue="bank_transfer">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="proof" className="text-right">
                  Proof
                </Label>
                <Input
                  id="proof"
                  type="file"
                  className="col-span-3"
                  accept="image/*,.pdf"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Processing..." : "Confirm Payment"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
