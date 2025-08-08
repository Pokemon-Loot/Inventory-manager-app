'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AddCardDialog } from '@/components/add-card-dialog'
import { CardTable } from '@/components/card-table'
import { BulkUploadDialog } from '@/components/bulk-upload-dialog'
import { createClient } from '@/utils/supabase/client'
import { Plus, Upload, TrendingUp, Package, Star, DollarSign, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Card {
  id: string
  name: string
  set_name: string
  rarity: string
  condition: string
  quantity: number
  purchase_price?: number
  market_price?: number
  image_url?: string
  card_number?: string
  notes?: string
  location?: string
  created_at: string
}

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchCards()
    }
  }, [user])

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCards(data || [])
    } catch (error) {
      console.error('Error fetching cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCardAdded = () => {
    fetchCards()
    setAddDialogOpen(false)
  }

  const handleBulkUpload = () => {
    fetchCards()
    setBulkUploadOpen(false)
  }

  // Calculate stats
  const totalCards = cards.reduce((sum, card) => sum + card.quantity, 0)
  const totalValue = cards.reduce((sum, card) => sum + (card.market_price || 0) * card.quantity, 0)
  const totalInvestment = cards.reduce((sum, card) => sum + (card.purchase_price || 0) * card.quantity, 0)
  const holoCards = cards.filter(card => card.rarity?.toLowerCase().includes('holo')).length

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to access the dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/">Go to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Pokemon Card Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href="/showcase">View Showcase</Link>
              </Button>
              <Button onClick={signOut} variant="outline">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCards}</div>
              <p className="text-xs text-muted-foreground">
                {cards.length} unique cards
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Current market value
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investment</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalInvestment.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Total purchase cost
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Holo Cards</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{holoCards}</div>
              <p className="text-xs text-muted-foreground">
                Holographic cards
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="collection" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="collection">Collection</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button onClick={() => setBulkUploadOpen(true)} variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </Button>
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </div>
          </div>

          <TabsContent value="collection">
            <Card>
              <CardHeader>
                <CardTitle>Your Collection</CardTitle>
                <CardDescription>
                  Manage and view all your Pokemon cards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CardTable cards={cards} onUpdate={fetchCards} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Collection Analytics</CardTitle>
                  <CardDescription>
                    Insights about your Pokemon card collection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span>Average Card Value</span>
                      <Badge variant="secondary">
                        ${cards.length > 0 ? (totalValue / totalCards).toFixed(2) : '0.00'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span>Most Valuable Card</span>
                      <Badge variant="secondary">
                        {cards.length > 0 
                          ? cards.reduce((max, card) => 
                              (card.market_price || 0) > (max.market_price || 0) ? card : max
                            ).name
                          : 'None'
                        }
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span>Profit/Loss</span>
                      <Badge variant={totalValue >= totalInvestment ? "default" : "destructive"}>
                        ${(totalValue - totalInvestment).toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AddCardDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen}
        onSuccess={handleCardAdded}
      />
      
      <BulkUploadDialog 
        open={bulkUploadOpen} 
        onOpenChange={setBulkUploadOpen}
        onSuccess={handleBulkUpload}
      />
    </div>
  )
}
