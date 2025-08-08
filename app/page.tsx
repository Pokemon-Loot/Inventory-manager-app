'use client'

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Package, TrendingUp, Shield, Search, Upload } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const { user, signIn, signOut } = useAuth()

  const quickLogin = async () => {
    try {
      await signIn('demo@example.com', 'demo123')
    } catch (error) {
      console.error('Quick login failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Pokemon Inventory</h1>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">Welcome, {user.email}</span>
                <Button onClick={signOut} variant="outline">Sign Out</Button>
                <Button asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link href="/showcase">View Showcase</Link>
                </Button>
                <Button onClick={quickLogin}>Quick Demo Login</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="h-4 w-4 mr-1" />
            Pokemon TCG Collection Manager
          </Badge>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Manage Your Pokemon Card Collection
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Track, organize, and value your Pokemon cards with real-time market data, 
            smart search, and beautiful showcase features.
          </p>
          <div className="flex gap-4 justify-center">
            {user ? (
              <Button asChild size="lg">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button onClick={quickLogin} size="lg">
                  Try Demo Account
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/showcase">View Showcase</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Powerful Features</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Search className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Smart Card Search</CardTitle>
                <CardDescription>
                  Search across multiple databases including Pokemon TCG API, TCGdx, and TCGPlayer
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Real-Time Pricing</CardTitle>
                <CardDescription>
                  Get current market values from Pokemon TCG API and TCGPlayer integration
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Package className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>
                  Track quantities, conditions, and locations with detailed analytics
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Upload className="h-8 w-8 text-orange-600 mb-2" />
                <CardTitle>Bulk Import/Export</CardTitle>
                <CardDescription>
                  Import from CSV files or export your collection for backup
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-red-600 mb-2" />
                <CardTitle>Secure Storage</CardTitle>
                <CardDescription>
                  Your data is safely stored with Supabase and backed up automatically
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Sparkles className="h-8 w-8 text-indigo-600 mb-2" />
                <CardTitle>Beautiful Showcase</CardTitle>
                <CardDescription>
                  Display your collection with high-quality images and detailed information
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
