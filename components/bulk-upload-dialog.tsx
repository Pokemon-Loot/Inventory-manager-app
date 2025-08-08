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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Upload, FileSpreadsheet, Copy, AlertTriangle } from "lucide-react"

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
  const [csvData, setCsvData] = useState("")
  const [pasteData, setPasteData] = useState("")
  const [previewCards, setPreviewCards] = useState<any[]>([])

  const parseCSVData = (data: string) => {
    const lines = data.trim().split("\n")
    if (lines.length < 2) {
      throw new Error("CSV must have at least a header row and one data row")
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    const cards = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))

      if (values.length >= 3 && values[2]) {
        // At least category, sub_category, title
        const card = {
          category: values[0] || "Trading Card Games",
          sub_category: values[1] || "Pokémon Cards",
          title: values[2] || "",
          description: values[3] || "",
          quantity: Number.parseInt(values[4]) || 1,
          type: values[5] || "Buy it Now",
          price: Number.parseFloat(values[6]) || 0,
          shipping_profile: values[7] || "0-1 oz",
          condition: values[8] || "Near Mint",
          selling_price: Number.parseFloat(values[9]) || 0,
          sku: values[10] || null, // Allow null/empty SKUs instead of empty string
          image_1: values[11] || "",
          image_2: values[12] || "",
          user_id: user?.id,
        }
        cards.push(card)
      }
    }
    return cards
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setCsvData(content)
        try {
          const parsed = parseCSVData(content)
          setPreviewCards(parsed.slice(0, 3)) // Show first 3 for preview
        } catch (err) {
          setPreviewCards([])
        }
      }
      reader.readAsText(file)
    }
  }

  const handleDataChange = (data: string) => {
    try {
      if (data.trim()) {
        const parsed = parseCSVData(data)
        setPreviewCards(parsed.slice(0, 3))
      } else {
        setPreviewCards([])
      }
    } catch (err) {
      setPreviewCards([])
    }
  }

  const handleBulkUpload = async (data: string) => {
    if (!user || !data.trim()) return

    setLoading(true)
    setError("")

    try {
      const cards = parseCSVData(data)

      if (cards.length === 0) {
        throw new Error("No valid cards found in the data")
      }

      // Process cards in batches to handle large uploads
      const batchSize = 50
      let successCount = 0
      let errorCount = 0
      const errors: string[] = []

      for (let i = 0; i < cards.length; i += batchSize) {
        const batch = cards.slice(i, i + batchSize)

        // Remove this SKU processing block:
        // const processedBatch = batch.map((card, index) => {
        //   if (card.sku && card.sku.trim()) {
        //     card.sku = `${card.sku}-${Date.now()}-${i + index}`
        //   } else {
        //     card.sku = null
        //   }
        //   return card
        // })

        // Replace with simple batch processing:
        try {
          const { error: batchError } = await supabase.from("pokemon_cards").insert(batch)

          if (batchError) {
            console.error(`Batch ${i / batchSize + 1} error:`, batchError)
            errors.push(`Batch ${i / batchSize + 1}: ${batchError.message}`)
            errorCount += batch.length
          } else {
            successCount += batch.length
          }
        } catch (batchErr: any) {
          console.error(`Batch ${i / batchSize + 1} exception:`, batchErr)
          errors.push(`Batch ${i / batchSize + 1}: ${batchErr.message}`)
          errorCount += batch.length
        }
      }

      if (successCount > 0) {
        onSuccess()
        onOpenChange(false)
        setCsvData("")
        setPasteData("")
        setPreviewCards([])

        if (errorCount > 0) {
          setError(
            `Uploaded ${successCount} cards successfully. ${errorCount} cards failed. Check console for details.`,
          )
        }
      } else {
        throw new Error(`All uploads failed. Errors: ${errors.join("; ")}`)
      }
    } catch (error: any) {
      console.error("Upload error:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const sampleCSV = `Category,Sub Category,Title,Description,Quantity,Type,Price,Shipping Profile,Condition,Selling Price,SKU,Image 1,Image 2
Trading Card Games,Pokémon Cards,Slaking Ex 227/191 Full Art,D,1,Buy it Now,2.00,0-1 oz,Near Mint,9.59,SLAKING-001,,
Trading Card Games,Pokémon Cards,Base Set Pikachu 58/102,Original Pikachu from Base Set,2,Buy it Now,15.00,0-1 oz,Excellent,25.00,PIKACHU-001,https://example.com/pikachu.jpg,
Trading Card Games,Pokémon Cards,Charizard Base Set 4/102,Holographic Charizard card,1,Auction,150.00,1-2 oz,Near Mint,200.00,,https://example.com/charizard1.jpg,https://example.com/charizard2.jpg`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Cards</DialogTitle>
          <DialogDescription>Upload multiple cards using CSV file, Google Sheets data, or copy/paste</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="csv" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="csv">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              CSV File
            </TabsTrigger>
            <TabsTrigger value="paste">
              <Copy className="mr-2 h-4 w-4" />
              Copy & Paste
            </TabsTrigger>
            <TabsTrigger value="sample">Sample Format</TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-file">Upload CSV File</Label>
              <input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            {csvData && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <Textarea
                  value={csvData}
                  onChange={(e) => {
                    setCsvData(e.target.value)
                    handleDataChange(e.target.value)
                  }}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="paste" className="space-y-4">
            <Alert>
              <AlertDescription>
                <strong>From Google Sheets:</strong> Select your data → Copy (Ctrl+C) → Paste below
                <br />
                <strong>From Excel:</strong> Select your data → Copy → Paste below
                <br />
                <strong>SKU Note:</strong> Duplicate or empty SKUs are now allowed
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="paste-data">Paste CSV Data</Label>
              <Textarea
                id="paste-data"
                value={pasteData}
                onChange={(e) => {
                  setPasteData(e.target.value)
                  handleDataChange(e.target.value)
                }}
                placeholder="Paste your CSV data here (including headers)..."
                rows={15}
                className="font-mono text-sm"
              />
            </div>
          </TabsContent>

          <TabsContent value="sample" className="space-y-4">
            <div className="space-y-2">
              <Label>Sample CSV Format</Label>
              <Textarea value={sampleCSV} readOnly rows={10} className="font-mono text-sm bg-gray-50" />
              <Alert>
                <AlertDescription>
                  <strong>Column Order (must match exactly):</strong>
                  <br />
                  Category, Sub Category, Title, Description, Quantity, Type, Price, Shipping Profile, Condition,
                  Selling Price, SKU, Image 1, Image 2
                  <br />
                  <strong>SKU Note:</strong> SKU can be empty or duplicate - system will handle it automatically
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>

        {/* Preview Section */}
        {previewCards.length > 0 && (
          <div className="space-y-2">
            <Label>Preview (First 3 cards)</Label>
            <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
              {previewCards.map((card, index) => (
                <div key={index} className="text-sm border-b border-gray-200 pb-2 mb-2 last:border-b-0">
                  <strong>{card.title}</strong> - {card.condition} - ${card.price}
                  {card.sku && <span className="text-gray-500"> (SKU: {card.sku})</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <Alert variant={error.includes("successfully") ? "default" : "destructive"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => handleBulkUpload(csvData || pasteData)} disabled={loading || (!csvData && !pasteData)}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Upload className="mr-2 h-4 w-4" />
            Upload Cards
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
