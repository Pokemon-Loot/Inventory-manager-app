"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Loader2, Copy, AlertTriangle } from "lucide-react"

export default function SetupPage() {
  const [email, setEmail] = useState("owner@pokemoncards.com")
  const [password, setPassword] = useState("pokemon123")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState<"form" | "created" | "confirmed">("form")

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // First, check if user already exists by trying to sign in
      const { data: existingUser, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (existingUser.user && !signInError) {
        // User already exists and can sign in
        setStep("confirmed")
        setSuccess(true)
        setLoading(false)
        return
      }

      // If sign in failed, try to create the account
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            is_owner: true,
          },
        },
      })

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          // Account exists but password might be wrong
          setError("Account already exists! Try logging in with these credentials on the main page.")
        } else {
          setError(signUpError.message)
        }
      } else if (data.user) {
        if (data.user.email_confirmed_at) {
          // Email is already confirmed
          setStep("confirmed")
          setSuccess(true)
        } else {
          // Email confirmation required
          setStep("created")
          setSuccess(true)
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyCredentials = () => {
    navigator.clipboard.writeText(`Email: ${email}\nPassword: ${password}`)
  }

  const testLogin = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(`Login test failed: ${error.message}`)
      } else {
        setStep("confirmed")
        setSuccess(true)
        // Sign out immediately after test
        await supabase.auth.signOut()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success && step === "confirmed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-green-800">Setup Complete!</CardTitle>
            <CardDescription>Your owner account is ready to use.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-green-800">Login Credentials:</h3>
                <Button size="sm" variant="outline" onClick={copyCredentials}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm font-mono">
                <strong>Email:</strong> {email}
              </p>
              <p className="text-sm font-mono">
                <strong>Password:</strong> {password}
              </p>
            </div>

            <Button className="w-full" onClick={() => (window.location.href = "/")}>
              Go to Login Page
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success && step === "created") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-yellow-800">Account Created!</CardTitle>
            <CardDescription>Check your email for confirmation (if required)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Your account has been created. Depending on your Supabase settings, you may need to confirm your email
                before logging in.
              </AlertDescription>
            </Alert>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-yellow-800">Login Credentials:</h3>
                <Button size="sm" variant="outline" onClick={copyCredentials}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm font-mono">
                <strong>Email:</strong> {email}
              </p>
              <p className="text-sm font-mono">
                <strong>Password:</strong> {password}
              </p>
            </div>

            <div className="space-y-2">
              <Button className="w-full" onClick={testLogin} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test Login
              </Button>
              <Button variant="outline" className="w-full bg-transparent" onClick={() => (window.location.href = "/")}>
                Go to Login Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Setup Pokemon Inventory</CardTitle>
          <CardDescription>Create your owner account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertDescription>
              <strong>Step 1:</strong> Make sure you've run the database setup script first!
              <br />
              <strong>Step 2:</strong> Create your owner account below.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSetup} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Owner Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Owner Account
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button variant="link" onClick={() => (window.location.href = "/")}>
              Already have an account? Login here
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
