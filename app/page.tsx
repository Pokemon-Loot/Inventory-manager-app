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
  // All hooks must be at the top level
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading, signIn } = useAuth();
  const router = useRouter();
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);
  // Request Access form state
  const [requestName, setRequestName] = useState("");
  const [requestEmail, setRequestEmail] = useState("");
  const [requestCompany, setRequestCompany] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [requestError, setRequestError] = useState("");

  // Wait for auth to load before rendering or redirecting
  if (authLoading) {
    return null;
  }
  if (user) {
    router.push("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/dashboard");
    }
    setLoading(false);
  };

  const handleQuickLogin = async () => {
    setLoading(true);
    setError("");
    const result = await signIn("owner@pokemonloot.com", "pokemon123");
    if (result.error) {
      setError(
        "Quick login failed. Please run the SQL setup script first and create the user in Supabase Auth dashboard."
      );
    } else {
      router.push("/dashboard");
    }
    setLoading(false);
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestName || !requestEmail) {
      setRequestError("Please enter your name and email.");
      return;
    }
    setRequestError("");
    setRequestSent(false);
    try {
      const res = await fetch("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: requestName, email: requestEmail, company: requestCompany })
      });
      const data = await res.json();
      if (data.success) {
        setRequestSent(true);
        setRequestName("");
        setRequestEmail("");
        setRequestCompany("");
      } else {
        setRequestError(data.error || "Failed to send request. Please try again later.");
      }
    } catch (err: any) {
      setRequestError("Failed to send request. Please try again later.");
    }
  };

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
      {/* Request Access Section */}
      <div className="relative z-20 bg-white/90 py-10 border-t border-b border-gray-200">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-2">Request Access</h2>
          <p className="text-center text-gray-700 mb-4">Want to create an account? Fill out the form below and we'll contact you!</p>
          <form onSubmit={handleRequestAccess} className="space-y-3 bg-white rounded shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Your Name *</label>
                <input type="text" className="w-full border rounded px-2 py-1" value={requestName} onChange={e => setRequestName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input type="email" className="w-full border rounded px-2 py-1" value={requestEmail} onChange={e => setRequestEmail(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company or Username (optional)</label>
              <input type="text" className="w-full border rounded px-2 py-1" value={requestCompany} onChange={e => setRequestCompany(e.target.value)} />
            </div>
            {requestError && <div className="text-red-600 text-sm">{requestError}</div>}
            {requestSent && <div className="text-green-700 text-sm">Request sent! Please check your email client to complete the request.</div>}
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700">Request Access</button>
          </form>
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2">Pricing</h3>
            <table className="w-full text-sm border rounded overflow-hidden">
              <thead>
                <tr className="bg-blue-100">
                  <th className="p-2 border">Plan</th>
                  <th className="p-2 border">Price</th>
                  <th className="p-2 border">Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border">Base</td>
                  <td className="p-2 border">$5</td>
                  <td className="p-2 border">Per 100 cards</td>
                </tr>
                <tr>
                  <td className="p-2 border">Monthly</td>
                  <td className="p-2 border">$1.99</td>
                  <td className="p-2 border">Ongoing access</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
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
