"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Upload, Link, X } from "lucide-react"

const supabase = createClient()

interface AddCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

// Updated dropdown options based on your template
const CATEGORIES = ["Trading Card Games", "Collectibles", "Sports Cards"]

const SUB_CATEGORIES = ["Pokémon Cards", "Magic: The Gathering", "Yu-Gi-Oh!", "Dragon Ball Super"]

const TYPES = ["Buy it Now", "Auction", "Best Offer"]

const CONDITIONS = ["Mint", "Near Mint", "Excellent", "Very Good", "Good", "Fair", "Poor"]

const SHIPPING_PROFILES = ["0-1 oz", "1-2 oz", "2-3 oz", "3-4 oz", "First Class", "Priority Mail"]

export function AddCardDialog({ open, onOpenChange, onSuccess }: AddCardDialogProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [uploadingImage, setUploadingImage] = useState<1 | 2 | null>(null)
  const [formData, setFormData] = useState({
    category: "Trading Card Games",
    sub_category: "Pokémon Cards",
    title: "",
    description: "",
    quantity: 1,
    type: "Buy it Now",
    price: 0,
    shipping_profile: "0-1 oz",
    condition: "Near Mint",
    selling_price: 0,
    sku: "",
    image_1: "",
    image_2: "",
  })

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

      setFormData((prev) => ({
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
    setFormData((prev) => ({
      ...prev,
      [`image_${imageNumber}`]: "",
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError("")

    try {
      const { error } = await supabase.from("pokemon_cards").insert([
        {
          ...formData,
          user_id: user.id,
        },
      ])

      if (error) throw error

      onSuccess()
      onOpenChange(false)
      // Reset form
      setFormData({
        category: "Trading Card Games",
        sub_category: "Pokémon Cards",
        title: "",
        description: "",
        quantity: 1,
        type: "Buy it Now",
        price: 0,
        shipping_profile: "0-1 oz",
        condition: "Near Mint",
        selling_price: 0,
        sku: "",
        image_1: "",
        image_2: "",
      })
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const ImageUploadSection = ({ imageNumber }: { imageNumber: 1 | 2 }) => {
    const imageUrl = formData[`image_${imageNumber}` as keyof typeof formData] as string

    return (
      <div className="space-y-3">
        <Label>Image {imageNumber} (Optional)</Label>

        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">
              <Link className="mr-2 h-4 w-4" />
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
              value={imageUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, [`image_${imageNumber}`]: e.target.value }))}
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
              {uploadingImage === imageNumber && <Loader2 className="h-4 w-4 animate-spin" />}
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Card</DialogTitle>
          <DialogDescription>Add a new card to your inventory</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Category and Sub Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub_category">Sub Category</Label>
              <Select
                value={formData.sub_category}
                onValueChange={(value) => setFormData({ ...formData, sub_category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUB_CATEGORIES.map((subCategory) => (
                    <SelectItem key={subCategory} value={subCategory}>
                      {subCategory}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Slaking Ex 227/191 Full Art"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Card description (optional)..."
            />
          </div>

          {/* Quantity, Type, Condition */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => setFormData({ ...formData, condition: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price and Selling Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Listing Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="selling_price">Selling Price ($)</Label>
              <Input
                id="selling_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: Number.parseFloat(e.target.value) || 0 })}
                placeholder="Actual sale price"
              />
            </div>
          </div>

          {/* Shipping Profile and SKU */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shipping_profile">Shipping Profile</Label>
              <Select
                value={formData.shipping_profile}
                onValueChange={(value) => setFormData({ ...formData, shipping_profile: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHIPPING_PROFILES.map((profile) => (
                    <SelectItem key={profile} value={profile}>
                      {profile}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Optional SKU"
              />
            </div>
          </div>

          {/* Image Upload Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploadSection imageNumber={1} />
            <ImageUploadSection imageNumber={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploadingImage !== null}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Card
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
