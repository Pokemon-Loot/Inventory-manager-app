'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { createClient } from '@/utils/supabase/client'
import { Trash2, Edit, Search, Filter } from 'lucide-react'
import Image from 'next/image'

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

interface CardTableProps {
  cards: Card[]
  onUpdate: () => void
}

export function CardTable({ cards, onUpdate }: CardTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [rarityFilter, setRarityFilter] = useState('all')
  const [conditionFilter, setConditionFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const supabase = createClient()

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id)

      if (error) throw error
      onUpdate()
    } catch (error) {
      console.error('Error deleting card:', error)
    }
  }

  // Filter and sort cards
  const filteredCards = cards
    .filter(card => {
      const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           card.set_name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRarity = rarityFilter === 'all' || card.rarity === rarityFilter
      const matchesCondition = conditionFilter === 'all' || card.condition === conditionFilter
      
      return matchesSearch && matchesRarity && matchesCondition
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof Card]
      let bValue: any = b[sortBy as keyof Card]
      
      if (sortBy === 'market_price' || sortBy === 'purchase_price') {
        aValue = aValue || 0
        bValue = bValue || 0
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const uniqueRarities = [...new Set(cards.map(card => card.rarity))].filter(Boolean)
  const uniqueConditions = [...new Set(cards.map(card => card.condition))].filter(Boolean)

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
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

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No cards in your collection yet.</p>
        <p className="text-sm text-gray-400">Add your first card to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={rarityFilter} onValueChange={setRarityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Rarity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rarities</SelectItem>
            {uniqueRarities.map(rarity => (
              <SelectItem key={rarity} value={rarity}>{rarity}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={conditionFilter} onValueChange={setConditionFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conditions</SelectItem>
            {uniqueConditions.map(condition => (
              <SelectItem key={condition} value={condition}>{condition}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Date Added</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="market_price">Market Price</SelectItem>
            <SelectItem value="quantity">Quantity</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </Button>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredCards.length} of {cards.length} cards
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Set</TableHead>
              <TableHead>Rarity</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Market Price</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCards.map((card) => (
              <TableRow key={card.id}>
                <TableCell>
                  <div className="w-12 h-16 relative">
                    <Image
                      src={card.image_url || '/placeholder.svg?height=64&width=48&query=pokemon+card'}
                      alt={card.name}
                      fill
                      className="object-cover rounded"
                      sizes="48px"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{card.name}</div>
                    {card.card_number && (
                      <div className="text-sm text-gray-500">#{card.card_number}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{card.set_name}</TableCell>
                <TableCell>
                  <Badge className={`${getRarityColor(card.rarity)} text-white border-0`}>
                    {card.rarity}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{card.condition}</Badge>
                </TableCell>
                <TableCell className="text-right">{card.quantity}</TableCell>
                <TableCell className="text-right">
                  {card.market_price ? `$${card.market_price.toFixed(2)}` : '-'}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {card.market_price 
                    ? `$${(card.market_price * card.quantity).toFixed(2)}` 
                    : '-'
                  }
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Card</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{card.name}" from your collection? 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(card.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
