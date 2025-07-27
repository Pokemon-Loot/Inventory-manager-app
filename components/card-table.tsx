"use client"

import type React from "react"

import { useState } from "react"
import type { PokemonCard } from "@/lib/supabase"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Save, X, ImageIcon, Upload, Link2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

const supabase = createClient()

interface CardTableProps {
  cards: PokemonCard[]
  onUpdate: () => void
}

export function CardTable({ cards, onUpdate }: CardTableProps) {
  const { user } = useAuth()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<PokemonCard>>({})
  const [error, setError] = useState("")
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [uploadingImage, setUploadingImage] = useState<1 | 2 | null>(null)

  const startEdit = (card: PokemonCard) => {
    setEditingId(card.id)
    setEditData(card)
    setError("")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData({})
    setError("")
    setShowImageDialog(false)
  }

  const saveEdit = async () => {
    if (!editingId || !editData) return

    try {
      const { error } = await supabase.from("pokemon_cards").update(editData).eq("id", editingId)

      if (error) throw error

      setEditingId(null)
      setEditData({})
      setShowImageDialog(false)
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

  const uploadImage = async (file: File, imageNumber: 1 | 2) => {
    if (!user) return

    setUploadingImage(imageNumber)
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage.from("card-images").upload(fileName, file)

      if (error) throw error

      const {
        data: { publicUrl },
      } = supabase.storage.from("card-images").getPublicUrl(fileName)

      setEditData((prev) => ({
        ...prev,
        [`image_${imageNumber}`]: publicUrl,
      }))
    } catch (error: any) {
      setError(`Failed to upload image: ${error.message}`)
    } finally {
      setUploadingImage(null)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, imageNumber: 1 | 2) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be smaller than 5MB")
        return
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file")
        return
      }

      uploadImage(file, imageNumber)
    }
  }

  const removeImage = (imageNumber: 1 | 2) => {
    setEditData((prev) => ({
      ...prev,
      [`image_${imageNumber}`]: "",
    }))
  }

  const ImageUploadSection = ({ imageNumber }: { imageNumber: 1 | 2 }) => {
    const imageUrl = editData[`image_${imageNumber}` as keyof typeof editData] as string

    return (
      <div className="space-y-3">
        <Label>Image {imageNumber} (Optional)</Label>

        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">
              <Link2 className="mr-2 h-4 w-4" />
              URL
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-2">
            <Input
              type="url"
              value={imageUrl || ""}
              onChange={(e) => setEditData((prev) => ({ ...prev, [`image_${imageNumber}`]: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
          </TabsContent>

          <TabsContent value="upload" className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, imageNumber)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={uploadingImage === imageNumber}
              />
              {uploadingImage === imageNumber && (
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
              )}
            </div>
            <p className="text-xs text-gray-500">Max 5MB, JPG/PNG/GIF supported</p>
          </TabsContent>
        </Tabs>

        {imageUrl && (
          <div className="relative">
            <img
              src={imageUrl || "/placeholder.svg"}
              alt={`Preview ${imageNumber}`}
              className="w-32 h-32 object-cover rounded border"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=128&width=128&text=Invalid+Image"
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={() => removeImage(imageNumber)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    )
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
                        <Button size="sm" variant="outline" onClick={() => setShowImageDialog(true)}>
                          <ImageIcon className="h-4 w-4" />
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

      {/* Image Upload Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Card Images</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploadSection imageNumber={1} />
              <ImageUploadSection imageNumber={2} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save Images</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
