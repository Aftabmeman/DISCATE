
"use client"

import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { sendEmailVerification, reload } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Mail, RefreshCw, Loader2, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const checkVerification = async () => {
    setChecking(true)
    try {
      await reload(auth.currentUser!)
      if (auth.currentUser?.emailVerified) {
        toast({ title: "Email Verified", description: "Welcome to Mentur AI!" })
        router.push("/dashboard")
      } else {
        toast({ title: "Still Unverified", description: "Please click the link in your email.", variant: "destructive" })
      }
    } finally {
      setChecking(false)
    }
  }

  const resendEmail = async () => {
    setLoading(true)
    try {
      await sendEmailVerification(auth.currentUser!)
      toast({ title: "Email Sent", description: "Check your inbox (and spam) for a new link." })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md border-none shadow-xl rounded-3xl text-center">
        <CardHeader>
          <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="text-primary h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-headline font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to <span className="font-bold text-foreground">{auth.currentUser?.email}</span>. Please verify your account to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <Button className="w-full h-12 rounded-xl font-bold" onClick={checkVerification} disabled={checking}>
            {checking ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <RefreshCw className="h-5 w-5 mr-2" />}
            I've Verified My Email
          </Button>
          <Button variant="outline" className="w-full h-12 rounded-xl" onClick={resendEmail} disabled={loading}>
            {loading ? "Sending..." : "Resend Verification Email"}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => auth.signOut()}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
