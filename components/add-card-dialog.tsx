'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/client'
import { Search, Plus, Upload, ExternalLink } from 'lucide-react'
import Image from 'next/image'

interface CardSearchResult {
  id: string
  name: string
  set: {
    name: string
    series: string
  }
  number: string
  rarity: string
  images: {
    small: string
    large: string
  }
  tcgplayer?: {
    prices?: {
      holofoil?: { market: number }
      normal?: { market: number }
      reverseHolofoil?: { market: number }
    }
  }
}

interface AddCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddCardDialog({ open, onOpenChange, onSuccess }: AddCardDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<CardSearchResult[]>([])
  const [selectedCard, setSelectedCard] = useState<CardSearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Form fields
  const [condition, setCondition] = useState('Near Mint')
  const [quantity, setQuantity] = useState(1)
  const [purchasePrice, setPurchasePrice] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [customImageUrl, setCustomImageUrl] = useState('')

  const supabase = createClient()

  const searchCards = async () => {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    try {
      // Search Pokemon TCG API
      const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      
      if (data.data) {
        setSearchResults(data.data.slice(0, 12)) // Limit to 12 results
      }
    } catch (error) {
      console.error('Search error:', error)
      // Fallback to mock data
      setSearchResults([
        {
          id: 'mock-1',
          name: searchQuery,
          set: { name: 'Base Set', series: 'Base' },
          number: '1',
          rarity: 'Rare',
          images: { 
            small: '/placeholder.svg?height=200&width=150',
            large: '/placeholder.svg?height=400&width=300'
          }
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCardSelect = (card: CardSearchResult) => {
    setSelectedCard(card)
    setCustomImageUrl(card.images.large)
  }

  const handleSave = async () => {
    if (!selectedCard) return

    setSaving(true)
    try {
      const marketPrice = selectedCard.tcgplayer?.prices?.holofoil?.market || 
                         selectedCard.tcgplayer?.prices?.normal?.market || 
                         0

      const { error } = await supabase
        .from('cards')
        .insert({
          name: selectedCard.name,
          set_name: selectedCard.set.name,
          card_number: selectedCard.number,
          rarity: selectedCard.rarity,
          condition,
          quantity,
          purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
          market_price: marketPrice,
          image_url: customImageUrl || selectedCard.images.large,
          location: location || null,
          notes: notes || null
        })

      if (error) throw error

      onSuccess()
      resetForm()
    } catch (error) {
      console.error('Error saving card:', error)
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setSearchQuery('')
    setSearchResults([])
    setSelectedCard(null)
    setCondition('Near Mint')
    setQuantity(1)
    setPurchasePrice('')
    setLocation('')
    setNotes('')
    setCustomImageUrl('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Card</DialogTitle>
          <DialogDescription>
            Search for a Pokemon card and add it to your collection
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Section */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search for Pokemon cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchCards()}
              />
              <Button onClick={searchCards} disabled={loading}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {searchResults.map((card) => (
                  <Card 
                    key={card.id} 
                    className={`cursor-pointer transition-all ${
                      selectedCard?.id === card.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                    }`}
                    onClick={() => handleCardSelect(card)}
                  >
                    <CardContent className="p-3">
                      <div className="aspect-[3/4] relative mb-2">
                        <Image
                          src={card.images.small || "/placeholder.svg"}
                          alt={card.name}
                          fill
                          className="object-cover rounded"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm truncate">{card.name}</h4>
                        <p className="text-xs text-gray-600 truncate">{card.set.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {card.rarity}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Selected Card Details */}
          {selectedCard && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Card Details</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Card Preview */}
                <div className="space-y-4">
                  <div className="aspect-[3/4] relative max-w-xs mx-auto">
                    <Image
                      src={customImageUrl || selectedCard.images.large}
                      alt={selectedCard.name}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-image">Custom Image URL (optional)</Label>
                    <Input
                      id="custom-image"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      placeholder="Enter custom image URL..."
                    />
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">{selectedCard.name}</h4>
                    <p className="text-sm text-gray-600">
                      {selectedCard.set.name} • {selectedCard.number}
                    </p>
                    <Badge variant="outline">{selectedCard.rarity}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="condition">Condition</Label>
                      <Select value={condition} onValueChange={setCondition}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mint">Mint</SelectItem>
                          <SelectItem value="Near Mint">Near Mint</SelectItem>
                          <SelectItem value="Excellent">Excellent</SelectItem>
                          <SelectItem value="Good">Good</SelectItem>
                          <SelectItem value="Light Played">Light Played</SelectItem>
                          <SelectItem value="Played">Played</SelectItem>
                          <SelectItem value="Poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="purchase-price">Purchase Price ($)</Label>
                      <Input
                        id="purchase-price"
                        type="number"
                        step="0.01"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Binder, Box, etc."
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional notes about this card..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Adding...' : 'Add to Collection'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
