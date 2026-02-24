"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Send } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import Lottie from "lottie-react"
import sentAnimation from "@/assets/sent.json"

export default function InvitePage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("Join our Affiliate Program")
  const [content, setContent] = useState(`Hi {name},

I'd like to invite you to join our affiliate program. We think you'd be a great fit!

You can earn competitive commissions for every referral.

Click here to join: {link}

Best regards,
Admin Team`)
  
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSend = () => {
    if (!name || !email) {
      toast.error("Please fill in name and email")
      return
    }
    
    // Simulate sending
    setTimeout(() => {
        setShowSuccess(true)
        setName("")
        setEmail("")
    }, 500)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Invite By Email</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle>Recipient Details</CardTitle>
            <CardDescription>
              Enter the details of the person you want to invite.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 md:col-span-1">
           <CardHeader>
            <CardTitle>Email Content</CardTitle>
            <CardDescription>
              Customize the subject and body of the invitation email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Body</Label>
              <Textarea 
                id="content" 
                className="min-h-[200px]" 
                value={content} 
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)} 
              />
              <p className="text-xs text-muted-foreground">
                Available placeholders: {"{name}"}, {"{link}"}
              </p>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={handleSend} className="w-full md:w-auto">
              <Send className="mr-2 h-4 w-4" />
              Send Invitation
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-[425px] flex flex-col items-center justify-center p-6">
            <div className="w-48 h-48">
              <Lottie animationData={sentAnimation} loop={false} autoplay={true} />
            </div>
            <h3 className="text-xl font-semibold text-center mt-4">Invitation Sent!</h3>
            <p className="text-center text-muted-foreground mt-2">
              The invitation email has been sent successfully.
            </p>
            <Button className="mt-6" onClick={() => setShowSuccess(false)}>
              Close
            </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
