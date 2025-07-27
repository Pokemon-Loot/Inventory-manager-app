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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Loader2, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"

const supabase = createClient()

interface BulkUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function BulkUploadDialog({ open, onOpenChange, onSuccess }: BulkUploadDialogProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [progress, setProgress] = useState(0)
  const [uploadStats, setUploadStats] = useState({ total: 0, successful: 0, failed: 0 })

  const parseCSV = (csvText: string) => {
    const lines = csvText.split("\n").filter((line) => line.trim())
    if (lines.length < 2) throw new Error("CSV must have at least a header row and one data row")

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    const rows = lines.slice(1)

    return rows.map((row) => {
      const values = row.split(",").map((v) => v.trim().replace(/"/g, ""))
      const card: any = { user_id: user?.id }

      headers.forEach((header, index) => {
        const value = values[index] || ""

        switch (header.toLowerCase()) {
          case "category":
            card.category = value || "Trading Card Games"
            break
          case "sub_category":
          case "subcategory":
            card.sub_category = value || "Pokémon Cards"
            break
          case "title":
            card.title = value
            break
          case "description":
            card.description = value || ""
            break
          case "quantity":
            card.quantity = Number.parseInt(value) || 1
            break
          case "type":
            card.type = value || "Buy it Now"
            break
          case "price":
          case "listing_price":
            card.price = Number.parseFloat(value) || 0
            break
          case "selling_price":
            card.selling_price = Number.parseFloat(value) || 0
            break
          case "condition":
            card.condition = value || "Near Mint"
            break
          case "shipping_profile":
            card.shipping_profile = value || "0-1 oz"
            break
          case "sku":
            card.sku = value.trim() || null
            break
          case "image_1":
          case "image1":
            card.image_1 = value || ""
            break
          case "image_2":
          case "image2":
            card.image_2 = value || ""
            break
        }
      })

      if (!card.title) {
        throw new Error(`Row missing required title: ${row}`)
      }

      return card
    })
  }

  const uploadInBatches = async (cards: any[], batchSize = 50) => {
    let successful = 0
    let failed = 0
    const total = cards.length

    for (let i = 0; i < cards.length; i += batchSize) {
      const batch = cards.slice(i, i + batchSize)

      try {
        const { error } = await supabase.from("pokemon_cards").insert(batch)

        if (error) {
          console.error("Batch error:", error)
          failed += batch.length
        } else {
          successful += batch.length
        }
      } catch (error) {
        console.error("Batch upload error:", error)
        failed += batch.length
      }

      const currentProgress = Math.round(((i + batchSize) / total) * 100)
      setProgress(Math.min(currentProgress, 100))
      setUploadStats({ total, successful, failed })
    }

    return { total, successful, failed }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a CSV file")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")
    setProgress(0)
    setUploadStats({ total: 0, successful: 0, failed: 0 })

    try {
      const csvText = await file.text()
      const cards = parseCSV(csvText)

      if (cards.length === 0) {
        throw new Error("No valid cards found in CSV")
      }

      const stats = await uploadInBatches(cards)

      if (stats.successful > 0) {
        setSuccess(
          `Successfully uploaded ${stats.successful} cards${stats.failed > 0 ? `, ${stats.failed} failed` : ""}`,
        )
        onSuccess()

        if (stats.failed === 0) {
          setTimeout(() => {
            onOpenChange(false)
            setSuccess("")
            setProgress(0)
            setUploadStats({ total: 0, successful: 0, failed: 0 })
          }, 2000)
        }
      } else {
        setError(`Failed to upload any cards. ${stats.failed} cards had errors.`)
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = `category,sub_category,title,description,quantity,type,price,selling_price,condition,shipping_profile,sku,image_1,image_2
Trading Card Games,Pokémon Cards,Pikachu VMAX,Rare holographic card,1,Buy it Now,25.99,0,Near Mint,0-1 oz,PIKA001,https://example.com/image1.jpg,
Trading Card Games,Pokémon Cards,Charizard EX,Ultra rare card,1,Auction,45.00,0,Mint,0-1 oz,CHAR002,,https://example.com/image2.jpg`

    const blob = new Blob([template], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "pokemon-cards-template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Upload Cards</DialogTitle>
          <DialogDescription>
            Upload multiple cards from a CSV file. Download the template to see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="csv-file">Select CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={loading}
              className="cursor-pointer"
            />
          </div>

          {loading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Uploading cards...</span>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="text-xs text-gray-500">
                Progress: {uploadStats.successful + uploadStats.failed} / {uploadStats.total} cards processed
                {uploadStats.successful > 0 && ` (${uploadStats.successful} successful)`}
                {uploadStats.failed > 0 && ` (${uploadStats.failed} failed)`}
              </div>
            </div>
          )}

          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              CSV Format Requirements
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                • Required columns: <code>title</code>
              </li>
              <li>
                • Optional columns:{" "}
                <code>
                  category, sub_category, description, quantity, type, price, selling_price, condition,
                  shipping_profile, sku, image_1, image_2
                </code>
              </li>
              <li>• Duplicate SKUs are allowed (will be handled automatically)</li>
              <li>• Images can be URLs or left empty</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={downloadTemplate}>
            <Upload className="mr-2 h-4 w-4" />
            Download Template
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
