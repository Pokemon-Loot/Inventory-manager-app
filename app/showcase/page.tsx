"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/utils/supabase/client"
import type { PokemonCard } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BackToTop } from "@/components/back-to-top"
import { Search, Filter, Star, Zap, Crown, Sparkles, ArrowLeft } from "lucide-react"
import Link from "next/link"

const supabase = createClient()

export default function ShowcasePage() {
  const { user } = useAuth()
  const [cards, setCards] = useState<PokemonCard[]>([])
  const [filteredCards, setFilteredCards] = useState<PokemonCard[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [conditionFilter, setConditionFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    if (user) {
      fetchCards()
    }
  }, [user])

  useEffect(() => {
    filterCards()
  }, [cards, searchTerm, conditionFilter, typeFilter])

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

  const filterCards = () => {
    let filtered = cards

    if (searchTerm) {
      filtered = filtered.filter(
        (card) =>
          card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (conditionFilter !== "all") {
      filtered = filtered.filter((card) => card.condition === conditionFilter)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((card) => card.type === typeFilter)
    }

    setFilteredCards(filtered)
  }

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "mint":
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
      case "near mint":
        return "bg-gradient-to-r from-green-400 to-green-600 text-white"
      case "excellent":
        return "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
      case "very good":
        return "bg-gradient-to-r from-purple-400 to-purple-600 text-white"
      case "good":
        return "bg-gradient-to-r from-orange-400 to-orange-600 text-white"
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
    }
  }

  const getCardRarity = (price: number) => {
    if (price >= 100) return { icon: Crown, label: "Legendary", color: "text-yellow-500" }
    if (price >= 50) return { icon: Star, label: "Rare", color: "text-purple-500" }
    if (price >= 20) return { icon: Zap, label: "Uncommon", color: "text-blue-500" }
    return { icon: Sparkles, label: "Common", color: "text-green-500" }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <h1 className="text-2xl font-bold mb-4">Please Login</h1>
            <p className="mb-4">You need to be logged in to view your card showcase.</p>
            <Link href="/">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading your Pokemon collection...</p>
        </div>
      </div>
    )
  }

  const totalValue = filteredCards.reduce((sum, card) => sum + (card.selling_price || 0) * card.quantity, 0)
  const totalCards = filteredCards.reduce((sum, card) => sum + card.quantity, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div
          className="h-64 bg-cover bg-center relative"
          style={{
            backgroundImage: `url('/placeholder.svg?height=400&width=1200&text=Pokemon+Trading+Cards+Collection')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/80"></div>
          <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
            <div className="text-white">
              <Link href="/dashboard">
                <Button variant="outline" className="mb-4 bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Pokemon Card Showcase
              </h1>
              <p className="text-xl md:text-2xl text-blue-100">Your legendary collection awaits!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
            <CardContent className="p-6 text-center">
              <Crown className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
              <div className="text-yellow-100">Collection Value</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{totalCards}</div>
              <div className="text-blue-100">Total Cards</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-teal-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{filteredCards.length}</div>
              <div className="text-green-100">Unique Cards</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 flex-1 min-w-64">
                <Search className="h-5 w-5 text-gray-500" />
                <Input
                  placeholder="Search your collection..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 bg-white/50"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <Select value={conditionFilter} onValueChange={setConditionFilter}>
                  <SelectTrigger className="w-40 border-0 bg-white/50">
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Conditions</SelectItem>
                    <SelectItem value="Mint">Mint</SelectItem>
                    <SelectItem value="Near Mint">Near Mint</SelectItem>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Very Good">Very Good</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40 border-0 bg-white/50">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Buy it Now">Buy it Now</SelectItem>
                  <SelectItem value="Auction">Auction</SelectItem>
                  <SelectItem value="Best Offer">Best Offer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Cards Grid */}
        {filteredCards.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🎴</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Cards Found</h3>
              <p className="text-gray-500 mb-6">
                {cards.length === 0
                  ? "Start building your collection by adding some Pokemon cards!"
                  : "Try adjusting your search or filters to find more cards."}
              </p>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Add Your First Card
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCards.map((card) => {
              const rarity = getCardRarity(card.price)
              const RarityIcon = rarity.icon

              return (
                <Card
                  key={card.id}
                  className="group hover:scale-105 transition-all duration-300 bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl overflow-hidden"
                >
                  <div className="relative">
                    {/* Card Image */}
                    <div className="aspect-[3/4] bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
                      {card.image_1 ? (
                        <img
                          src={card.image_1 || "/placeholder.svg"}
                          alt={card.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = `/placeholder.svg?height=400&width=300&text=${encodeURIComponent(card.title)}`
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-200">
                          <img
                            src={`/placeholder.svg?height=200&width=150&text=Pokemon+Card`}
                            alt="Pokemon Card"
                            className="opacity-50"
                          />
                        </div>
                      )}

                      {/* Rarity Badge */}
                      <div className="absolute top-2 right-2">
                        <Badge className={`${rarity.color} bg-white/90 backdrop-blur-sm border-0`}>
                          <RarityIcon className="h-3 w-3 mr-1" />
                          {rarity.label}
                        </Badge>
                      </div>

                      {/* Quantity Badge */}
                      {card.quantity > 1 && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-black/70 text-white border-0">x{card.quantity}</Badge>
                        </div>
                      )}
                    </div>

                    {/* Card Info */}
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {card.title}
                          </h3>
                          <p className="text-sm text-gray-600">{card.sub_category}</p>
                        </div>

                        {card.description && <p className="text-sm text-gray-600 line-clamp-2">{card.description}</p>}

                        <div className="flex items-center justify-between">
                          <Badge className={getConditionColor(card.condition)}>{card.condition}</Badge>
                          <Badge variant="outline" className="border-blue-200 text-blue-700">
                            {card.type}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div>
                            <div className="text-lg font-bold text-green-600">${card.price.toFixed(2)}</div>
                            {card.selling_price && card.selling_price > 0 && (
                              <div className="text-sm text-gray-500">Sold: ${card.selling_price.toFixed(2)}</div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Total Value</div>
                            <div className="font-bold text-purple-600">
                              ${((card.selling_price || card.price) * card.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <BackToTop />
    </div>
  )
}
