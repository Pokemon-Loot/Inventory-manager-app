"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Search, TrendingUp, ExternalLink, ImageIcon } from "lucide-react"

interface TCGPlayerIntegrationProps {
  cardName: string
  onSelectCard: (cardData: any) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SearchResult {
  name: string
  setName?: string
  cardNumber?: string
  rarity?: string
  marketPrice?: number
  lowPrice?: number
  midPrice?: number
  highPrice?: number
  image?: string
  tcgplayerUrl?: string
}

export function TCGPlayerIntegration({ cardName, onSelectCard, open, onOpenChange }: TCGPlayerIntegrationProps) {
  const [searchQuery, setSearchQuery] = useState(cardName || "")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [error, setError] = useState("")
  const [sources, setSources] = useState<any>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError("")
    setResults([])

    try {
      const response = await fetch(`/api/tcgplayer?cardName=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Search failed")
      }

      if (data.success) {
        setResults(data.results || [])
        setSources(data.sources)

        if (data.results?.length === 0) {
          setError("No cards found. Try a different search term.")
        }
      } else {
        setError(data.error || "Search failed")
      }
    } catch (error: any) {
      console.error("Search error:", error)
      setError(error.message || "Failed to search for cards")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCard = (card: SearchResult) => {
    onSelectCard({
      name: card.name,
      setName: card.setName,
      cardNumber: card.cardNumber,
      rarity: card.rarity,
      marketPrice: card.marketPrice || 0,
      lowPrice: card.lowPrice || 0,
      midPrice: card.midPrice || 0,
      highPrice: card.highPrice || 0,
      image: card.image,
      price: card.marketPrice || 0,
    })
  }

  // Auto-search when dialog opens with a card name
  useState(() => {
    if (open && cardName && cardName !== searchQuery) {
      setSearchQuery(cardName)
      setTimeout(() => handleSearch(), 100)
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Search Card Market Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search">Card Name</Label>
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., Charizard VMAX, N's Reshiram 167/159"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={loading || !searchQuery.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </Button>
            </div>
          </div>

          {/* Data Sources Info */}
          {sources && (
            <Alert>
              <AlertDescription>
                <strong>Data Sources:</strong> Pokemon TCG API ({sources.pokemonTCG} results), TCGdx ({sources.tcgdx}{" "}
                results)
                {sources.mock > 0 && `, Mock data (${sources.mock} results)`}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Searching multiple sources...</p>
              </div>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Search Results ({results.length})</h3>
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {results.map((card, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Card Image */}
                        <div className="flex-shrink-0">
                          {card.image ? (
                            <img
                              src={card.image || "/placeholder.svg"}
                              alt={card.name}
                              className="w-16 h-22 object-cover rounded border"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg?height=88&width=64&text=Card"
                              }}
                            />
                          ) : (
                            <div className="w-16 h-22 bg-gray-100 rounded border flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Card Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-sm truncate">{card.name}</h4>
                              {card.setName && <p className="text-xs text-muted-foreground">{card.setName}</p>}
                              <div className="flex gap-2 mt-1">
                                {card.cardNumber && (
                                  <Badge variant="outline" className="text-xs">
                                    #{card.cardNumber}
                                  </Badge>
                                )}
                                {card.rarity && (
                                  <Badge variant="secondary" className="text-xs">
                                    {card.rarity}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Pricing */}
                            <div className="text-right">
                              {card.marketPrice && card.marketPrice > 0 ? (
                                <div>
                                  <p className="font-semibold text-green-600">${card.marketPrice.toFixed(2)}</p>
                                  {card.lowPrice && card.highPrice && (
                                    <p className="text-xs text-muted-foreground">
                                      ${card.lowPrice.toFixed(2)} - ${card.highPrice.toFixed(2)}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground">No pricing data</p>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" onClick={() => handleSelectCard(card)} className="flex-1">
                              Select Card
                            </Button>
                            {card.tcgplayerUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(card.tcgplayerUrl, "_blank")}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {!loading && results.length === 0 && searchQuery && !error && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No cards found for "{searchQuery}"</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try searching with a different card name or check the spelling
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TCGPlayerIntegration
