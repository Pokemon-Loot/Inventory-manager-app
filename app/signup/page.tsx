"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Loader2, ArrowRight, User } from "lucide-react"

const supabase = createClient()

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Sign up without email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation
        },
      })

      if (error) {
        if (error.message.includes("already registered")) {
          setError("Account already exists! Try logging in instead.")
        } else {
          setError(error.message)
        }
      } else if (data.user) {
        // Account created successfully - no email verification needed
        setSuccess(true)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickSetup = async () => {
    setLoading(true)
    setError("")

    try {
      // Try to sign in with the pre-created account
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "owner@pokemoncards.com",
        password: "pokemon123",
      })

      if (error) {
        setError("Quick setup account not found. Please run the SQL setup script first.")
      } else {
        // Success! Redirect to dashboard
        window.location.href = "/dashboard"
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-green-800">Account Created!</CardTitle>
            <CardDescription>Your Pokemon inventory account is ready to use</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                <strong>Success!</strong> Account created and ready to use immediately.
              </AlertDescription>
            </Alert>

            <Button className="w-full" onClick={() => (window.location.href = "/")}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Quick Setup Option */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-green-800">Quick Setup</CardTitle>
            <CardDescription className="text-green-700">Use the pre-configured account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <User className="h-4 w-4" />
              <AlertDescription>
                <strong>Ready to use:</strong>
                <br />
                Email: owner@pokemoncards.com
                <br />
                Password: pokemon123
              </AlertDescription>
            </Alert>

            <Button onClick={handleQuickSetup} disabled={loading} className="w-full" size="lg">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <ArrowRight className="mr-2 h-4 w-4" />
              Use Quick Setup Account
            </Button>
          </CardContent>
        </Card>

        {/* Custom Account Creation */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold">Create Custom Account</CardTitle>
            <CardDescription>Or create your own account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a secure password"
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
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
    </div>
  )
}
