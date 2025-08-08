'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Star, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Demo cards data
const demoCards = [
  {
    id: '1',
    name: 'Charizard',
    set_name: 'Base Set',
    rarity: 'Rare Holo',
    condition: 'Near Mint',
    quantity: 1,
    market_price: 350.00,
    image_url: 'https://images.pokemontcg.io/base1/4_hires.png',
    card_number: '4/102',
    type: 'Fire'
  },
  {
    id: '2',
    name: 'Blastoise',
    set_name: 'Base Set',
    rarity: 'Rare Holo',
    condition: 'Near Mint',
    quantity: 1,
    market_price: 280.00,
    image_url: 'https://images.pokemontcg.io/base1/2_hires.png',
    card_number: '2/102',
    type: 'Water'
  },
  {
    id: '3',
    name: 'Venusaur',
    set_name: 'Base Set',
    rarity: 'Rare Holo',
    condition: 'Near Mint',
    quantity: 1,
    market_price: 220.00,
    image_url: 'https://images.pokemontcg.io/base1/15_hires.png',
    card_number: '15/102',
    type: 'Grass'
  },
  {
    id: '4',
    name: 'Pikachu',
    set_name: 'Base Set',
    rarity: 'Common',
    condition: 'Near Mint',
    quantity: 3,
    market_price: 45.00,
    image_url: 'https://images.pokemontcg.io/base1/58_hires.png',
    card_number: '58/102',
    type: 'Electric'
  },
  {
    id: '5',
    name: 'Alakazam',
    set_name: 'Base Set',
    rarity: 'Rare Holo',
    condition: 'Near Mint',
    quantity: 1,
    market_price: 180.00,
    image_url: 'https://images.pokemontcg.io/base1/1_hires.png',
    card_number: '1/102',
    type: 'Psychic'
  },
  {
    id: '6',
    name: 'Machamp',
    set_name: 'Base Set',
    rarity: 'Rare Holo',
    condition: 'Near Mint',
    quantity: 1,
    market_price: 160.00,
    image_url: 'https://images.pokemontcg.io/base1/8_hires.png',
    card_number: '8/102',
    type: 'Fighting'
  }
]

export default function ShowcasePage() {
  const [cards, setCards] = useState(demoCards)
  const [loading, setLoading] = useState(false)

  const totalValue = cards.reduce((sum, card) => sum + (card.market_price * card.quantity), 0)
  const totalCards = cards.reduce((sum, card) => sum + card.quantity, 0)

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'rare holo':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500'
      case 'rare':
        return 'bg-gradient-to-r from-purple-400 to-pink-500'
      case 'uncommon':
        return 'bg-gradient-to-r from-blue-400 to-cyan-500'
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Collection Showcase</h1>
                <p className="text-sm text-gray-600">Demo collection featuring classic Pokemon cards</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Total Value</div>
                <div className="text-2xl font-bold text-green-600">${totalValue.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Total Cards</div>
                <div className="text-2xl font-bold text-blue-600">{totalCards}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">${totalValue.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total Collection Value</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-600">{cards.filter(c => c.rarity.includes('Holo')).length}</div>
                <div className="text-sm text-gray-600">Holographic Cards</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">{totalCards}</div>
                <div className="text-sm text-gray-600">Total Cards</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600">{new Set(cards.map(c => c.set_name)).size}</div>
                <div className="text-sm text-gray-600">Different Sets</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Cards Grid */}
      <section className="px-4 pb-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cards.map((card) => (
              <Card key={card.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[3/4] relative">
                  <Image
                    src={card.image_url || "/placeholder.svg"}
                    alt={card.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className={`${getRarityColor(card.rarity)} text-white border-0`}>
                      {card.rarity}
                    </Badge>
                  </div>
                  {card.quantity > 1 && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary">
                        x{card.quantity}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-bold text-lg">{card.name}</h3>
                      <p className="text-sm text-gray-600">{card.set_name} • {card.card_number}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">{card.condition}</Badge>
                      <div className="text-right">
                        <div className="font-bold text-green-600">${card.market_price.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">Market Price</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to manage your own collection?</h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Start tracking your Pokemon cards with real-time pricing, smart search, and beautiful showcase features.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">View Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
