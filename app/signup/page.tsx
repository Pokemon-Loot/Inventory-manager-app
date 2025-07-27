"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Loader2, ArrowRight, User } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const { signUp, signIn } = useAuth()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signUp(email, password)

    if (result.error) {
      if (result.error.includes("already registered")) {
        setError("Account already exists! Try logging in instead.")
      } else {
        setError(result.error)
      }
    } else {
      setSuccess(true)
      // Redirect to dashboard after successful signup
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 2000)
    }

    setLoading(false)
  }

  const handleQuickSetup = async () => {
    setLoading(true)
    setError("")

    const result = await signIn("owner@pokemonloot.com", "pokemon123")

    if (result.error) {
      setError("Quick setup account not found. Please run the SQL setup script first.")
    } else {
      window.location.href = "/dashboard"
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-green-800">Account Created!</CardTitle>
            <CardDescription>Redirecting to your dashboard...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                <strong>Success!</strong> Account created and logged in automatically. No email confirmation needed!
              </AlertDescription>
            </Alert>

            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
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
                Email: owner@pokemonloot.com
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
            <CardTitle className="text-xl font-bold">Create Account</CardTitle>
            <CardDescription>No email confirmation required!</CardDescription>
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
                Create Account & Login
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
