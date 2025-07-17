"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import type { PokemonCard } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BackToTop } from "@/components/back-to-top"
import { LogOut, Plus, Upload, Download, DollarSign, Package, Eye, Star } from "lucide-react"
import { AddCardDialog } from "@/components/add-card-dialog"
import { BulkUploadDialog } from "@/components/bulk-upload-dialog"
import { CardTable } from "@/components/card-table"
import { Loading } from "@/components/loading"
import Link from "next/link"

const supabase = createClient()

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth()
  const router = useRouter()
  const [cards, setCards] = useState<PokemonCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showBulkDialog, setShowBulkDialog] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
      return
    }

    if (user) {
      fetchCards()
    }
  }, [user, authLoading, router])

  const fetchCards = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("pokemon_cards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching cards:", error)
      } else {
        setCards(data || [])
      }
    } catch (error) {
      console.error("Error fetching cards:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const exportToCSV = () => {
    const headers = [
      "Category",
      "Sub Category",
      "Title",
      "Description",
      "Quantity",
      "Type",
      "Price",
      "Shipping Profile",
      "Condition",
      "Selling Price",
      "SKU",
      "Image 1",
      "Image 2",
    ]

    const csvContent = [
      headers.join(","),
      ...cards.map((card) =>
        [
          card.category,
          card.sub_category,
          `"${card.title}"`,
          `"${card.description || ""}"`,
          card.quantity,
          card.type,
          card.price,
          card.shipping_profile || "",
          card.condition,
          card.selling_price || 0,
          card.sku || "",
          card.image_1 || "",
          card.image_2 || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pokemon-inventory-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (authLoading || loading) {
    return <Loading message="Loading your Pokemon card inventory..." />
  }

  const totalValue = cards.reduce((sum, card) => sum + (card.selling_price || 0) * card.quantity, 0)
  const totalCards = cards.reduce((sum, card) => sum + card.quantity, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <img src="/placeholder.svg?height=40&width=40&text=⚡" alt="Pokemon" className="h-10 w-10" />
              <h1 className="text-xl font-bold text-white">Pokemon Card Inventory Manager</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/showcase">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Eye className="h-4 w-4 mr-2" />
                  Showcase
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="mb-8 relative overflow-hidden rounded-2xl">
          <div
            className="h-32 bg-cover bg-center relative"
            style={{
              backgroundImage: `url('/placeholder.svg?height=200&width=800&text=Pokemon+Master+Dashboard')`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/80"></div>
            <div className="relative z-10 h-full flex items-center px-6">
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-1">Welcome back, Pokemon Master!</h2>
                <p className="text-blue-100">Manage your legendary collection</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Collection Value</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
              <p className="text-xs text-yellow-100">Based on current inventory prices</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
              <Package className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCards}</div>
              <p className="text-xs text-blue-100">{cards.length} unique cards in inventory</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Card
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowBulkDialog(true)}
            className="border-2 border-purple-200 hover:bg-purple-50"
          >
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Button
            variant="outline"
            onClick={exportToCSV}
            className="border-2 border-blue-200 hover:bg-blue-50 bg-transparent"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Link href="/showcase">
            <Button variant="outline" className="border-2 border-orange-200 hover:bg-orange-50 bg-transparent">
              <Star className="h-4 w-4 mr-2" />
              View Showcase
            </Button>
          </Link>
        </div>

        {/* Cards Table */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <img src="/placeholder.svg?height=24&width=24&text=🎴" alt="Cards" className="h-6 w-6" />
              Inventory Management
            </CardTitle>
            <CardDescription>Manage your Pokemon card collection</CardDescription>
          </CardHeader>
          <CardContent>
            <CardTable cards={cards} onUpdate={fetchCards} />
          </CardContent>
        </Card>
      </main>

      <AddCardDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSuccess={fetchCards} />

      <BulkUploadDialog open={showBulkDialog} onOpenChange={setShowBulkDialog} onSuccess={fetchCards} />

      <BackToTop />
    </div>
  )
}
