"use client"

import { useState } from "react"
import type { PokemonCard } from "@/lib/supabase"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Save, X, ImageIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const supabase = createClient()

interface CardTableProps {
  cards: PokemonCard[]
  onUpdate: () => void
}

export function CardTable({ cards, onUpdate }: CardTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<PokemonCard>>({})
  const [error, setError] = useState("")

  const startEdit = (card: PokemonCard) => {
    setEditingId(card.id)
    setEditData(card)
    setError("")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData({})
    setError("")
  }

  const saveEdit = async () => {
    if (!editingId || !editData) return

    try {
      const { error } = await supabase.from("pokemon_cards").update(editData).eq("id", editingId)

      if (error) throw error

      setEditingId(null)
      setEditData({})
      onUpdate()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const deleteCard = async (id: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return

    try {
      const { error } = await supabase.from("pokemon_cards").delete().eq("id", id)

      if (error) throw error
      onUpdate()
    } catch (error: any) {
      setError(error.message)
    }
  }

  if (cards.length === 0) {
    return <div className="text-center py-8 text-gray-500">No cards in inventory. Add some cards to get started!</div>
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Listing Price</TableHead>
              <TableHead>Selling Price</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cards.map((card) => (
              <TableRow key={card.id}>
                <TableCell>
                  {card.image_1 ? (
                    <img
                      src={card.image_1 || "/placeholder.svg"}
                      alt={card.title}
                      className="w-12 h-12 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=48&width=48&text=No+Image"
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {editingId === card.id ? (
                    <Input
                      value={editData.title || ""}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className="w-full"
                    />
                  ) : (
                    <div>
                      <div>{card.title}</div>
                      <div className="text-sm text-gray-500">{card.sub_category}</div>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{card.condition}</Badge>
                </TableCell>
                <TableCell>
                  {editingId === card.id ? (
                    <Input
                      type="number"
                      min="0"
                      value={editData.quantity || 0}
                      onChange={(e) => setEditData({ ...editData, quantity: Number.parseInt(e.target.value) || 0 })}
                      className="w-20"
                    />
                  ) : (
                    card.quantity
                  )}
                </TableCell>
                <TableCell>
                  {editingId === card.id ? (
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editData.price || 0}
                      onChange={(e) => setEditData({ ...editData, price: Number.parseFloat(e.target.value) || 0 })}
                      className="w-24"
                    />
                  ) : (
                    `$${card.price.toFixed(2)}`
                  )}
                </TableCell>
                <TableCell>
                  {editingId === card.id ? (
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editData.selling_price || 0}
                      onChange={(e) =>
                        setEditData({ ...editData, selling_price: Number.parseFloat(e.target.value) || 0 })
                      }
                      className="w-24"
                    />
                  ) : (
                    `$${(card.selling_price || 0).toFixed(2)}`
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  $
                  {(editingId === card.id
                    ? (editData.selling_price || 0) * (editData.quantity || 0)
                    : (card.selling_price || 0) * card.quantity
                  ).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant={card.type === "Buy it Now" ? "default" : "secondary"}>{card.type}</Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-500">{card.sku || "-"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {editingId === card.id ? (
                      <>
                        <Button size="sm" onClick={saveEdit}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => startEdit(card)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteCard(card.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
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
