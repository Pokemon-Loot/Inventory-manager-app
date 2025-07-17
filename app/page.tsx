"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BackToTop } from "@/components/back-to-top"
import { Loader2, Zap, Star, Crown, Sparkles, Eye, Database, Upload } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { user, signIn } = useAuth()
  const router = useRouter()
  const [showDemoCredentials, setShowDemoCredentials] = useState(false)

  // Redirect if already logged in
  if (user) {
    router.push("/dashboard")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn(email, password)

    if (result.error) {
      setError(result.error)
    } else {
      router.push("/dashboard")
    }

    setLoading(false)
  }

  const handleQuickLogin = async () => {
    setLoading(true)
    setError("")

    const result = await signIn("owner@pokemonloot.com", "pokemon123")

    if (result.error) {
      setError(
        "Quick login failed. Please run the SQL setup script first and create the user in Supabase Auth dashboard.",
      )
    } else {
      router.push("/dashboard")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
      </div>

      {/* Main Heading Section */}
      <div className="relative z-20 bg-white py-0">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Inventory Master - Organize
            </h1>
            <p className="text-xl md:text-2xl text-black mb-8 max-w-2xl mx-auto">
              Organize, showcase, and manage your legendary Pokemon card collection like a true Pokemon Master!
            </p>
          </div>
        </div>
      </div>

      {/* Three Column Section */}
      <div className="relative z-20 bg-white pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Quick Start Adventure */}
            <Card className="border-0 shadow-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Start Adventure
                </CardTitle>
                <CardDescription className="text-yellow-100">
                  Jump right in with the demo account - no setup required!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleQuickLogin}
                  disabled={loading}
                  className="w-full bg-white text-orange-600 hover:bg-gray-100 font-bold"
                  size="lg"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Crown className="mr-2 h-4 w-4" />
                  Start as Pokemon Master
                </Button>
              </CardContent>
            </Card>

            {/* Trainer Login */}
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Trainer Login
                </CardTitle>
                <CardDescription>Access your Pokemon card collection</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-3">
                  {error && (
                    <Alert variant="destructive" className="text-xs">
                      <AlertDescription>
                        <strong>Login Failed:</strong> {error}
                        {error.includes("Invalid login credentials") && (
                          <div className="mt-2 text-xs">
                            <p>
                              Need to create the user account? Run script 015-create-live-user.sql and then create the
                              user in your Supabase Auth dashboard.
                            </p>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-sm">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="border-2 border-blue-200 focus:border-purple-400 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-sm">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="border-2 border-blue-200 focus:border-purple-400 text-sm"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Star className="mr-2 h-4 w-4" />
                    Begin Journey
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Access */}
            <Card className="border-0 shadow-2xl bg-gradient-to-r from-green-500 to-teal-600 text-white">
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
                  <Eye className="h-5 w-5" />
                  Quick Access
                </CardTitle>
                <CardDescription className="text-blue-100">Explore without logging in</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/showcase">
                  <Button variant="outline" className="w-full bg-white text-green-600 hover:bg-gray-100 border-0">
                    <Eye className="mr-2 h-4 w-4" />
                    View Showcase
                  </Button>
                </Link>
                <Link href="/refresh-status">
                  <Button variant="outline" className="w-full bg-white text-green-600 hover:bg-gray-100 border-0">
                    <Database className="mr-2 h-4 w-4" />
                    System Status
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Demo Info - Generic */}
          <div className="max-w-md mx-auto mt-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => setShowDemoCredentials(!showDemoCredentials)}
                    className="text-white hover:bg-white/10 mb-2"
                    size="sm"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {showDemoCredentials ? "Hide" : "Show"} Demo Info
                    <span className="ml-2 text-xs">{showDemoCredentials ? "▲" : "▼"}</span>
                  </Button>

                  {showDemoCredentials && (
                    <div className="text-sm space-y-1 animate-in slide-in-from-top-2 duration-200">
                      <p className="text-blue-100">Demo account available for testing</p>
                      <p className="text-blue-100">Use the "Quick Start Adventure" button above</p>
                      <p className="text-xs text-blue-200 mt-2 opacity-75">
                        Or create your own account with custom credentials
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Master Your Collection</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Everything you need to organize, track, and showcase your Pokemon cards like a professional collector
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center text-white">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Smart Organization</h3>
              <p className="text-blue-100 text-sm">Categorize and track every detail of your cards</p>
            </div>

            <div className="text-center text-white">
              <div className="bg-gradient-to-r from-blue-400 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Visual Showcase</h3>
              <p className="text-blue-100 text-sm">Beautiful gallery to display your collection</p>
            </div>

            <div className="text-center text-white">
              <div className="bg-gradient-to-r from-green-400 to-teal-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Bulk Import</h3>
              <p className="text-blue-100 text-sm">Import hundreds of cards from CSV files</p>
            </div>

            <div className="text-center text-white">
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Value Tracking</h3>
              <p className="text-blue-100 text-sm">Monitor your collection's worth over time</p>
            </div>
          </div>
        </div>
      </div>

      <BackToTop />
    </div>
  )
}
