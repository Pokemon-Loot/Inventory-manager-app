"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Loader2, AlertTriangle, User, ArrowRight } from "lucide-react"

export default function SimpleSetupPage() {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"start" | "creating" | "success" | "error">("start")
  const [message, setMessage] = useState("")

  const createAccount = async () => {
    setLoading(true)
    setStep("creating")
    setMessage("Creating your owner account...")

    try {
      // First, try to sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: "owner@pokemoncards.com",
        password: "pokemon123",
        options: {
          data: {
            is_owner: true,
          },
        },
      })

      if (signUpError && !signUpError.message.includes("already registered")) {
        throw signUpError
      }

      // If signup worked or user already exists, try to sign in
      setMessage("Verifying account...")

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: "owner@pokemoncards.com",
        password: "pokemon123",
      })

      if (signInError) {
        // If sign in failed, the account might need confirmation
        if (signInError.message.includes("Email not confirmed")) {
          setStep("success")
          setMessage("Account created! Email confirmation may be required depending on your Supabase settings.")
        } else {
          throw signInError
        }
      } else {
        // Success! Sign out immediately
        await supabase.auth.signOut()
        setStep("success")
        setMessage("Account created and verified successfully!")
      }
    } catch (error: any) {
      console.error("Setup error:", error)
      setStep("error")
      setMessage(error.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "owner@pokemoncards.com",
        password: "pokemon123",
      })

      if (error) {
        setMessage(`Login test failed: ${error.message}`)
      } else {
        setMessage("Login test successful!")
        // Sign out immediately
        await supabase.auth.signOut()
      }
    } catch (error: any) {
      setMessage(`Test error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Simple Account Setup</CardTitle>
            <CardDescription>One-click owner account creation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === "start" && (
              <>
                <Alert>
                  <User className="h-4 w-4" />
                  <AlertDescription>
                    <strong>This will create your owner account:</strong>
                    <br />
                    Email: owner@pokemoncards.com
                    <br />
                    Password: pokemon123
                  </AlertDescription>
                </Alert>

                <Button onClick={createAccount} disabled={loading} className="w-full" size="lg">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Owner Account
                </Button>
              </>
            )}

            {step === "creating" && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {step === "success" && (
              <>
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Success!</strong> {message}
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Button onClick={testLogin} disabled={loading} variant="outline" className="w-full bg-transparent">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Test Login
                  </Button>

                  <Button onClick={() => (window.location.href = "/")} className="w-full">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Go to Login Page
                  </Button>
                </div>

                {message && step === "success" && (
                  <Alert>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}
              </>
            )}

            {step === "error" && (
              <>
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Error:</strong> {message}
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Button onClick={() => setStep("start")} variant="outline" className="w-full bg-transparent">
                    Try Again
                  </Button>

                  <Button
                    onClick={() => (window.location.href = "/create-account")}
                    variant="outline"
                    className="w-full bg-transparent"
                  >
                    Use SQL Method Instead
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">Having trouble?</p>
              <div className="flex gap-2">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => (window.location.href = "/create-account")}
                  className="flex-1"
                >
                  SQL Method
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => (window.location.href = "/project-setup")}
                  className="flex-1"
                >
                  Full Guide
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
