'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/utils/supabase/client'
import { Upload, Download, FileText, AlertCircle } from 'lucide-react'
import Papa from 'papaparse'

interface BulkUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface CSVRow {
  name: string
  set_name: string
  card_number?: string
  rarity: string
  condition: string
  quantity: string
  purchase_price?: string
  market_price?: string
  image_url?: string
  location?: string
  notes?: string
}

export function BulkUploadDialog({ open, onOpenChange, onSuccess }: BulkUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errors, setErrors] = useState<string[]>([])

  const supabase = createClient()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      parseCSV(selectedFile)
    }
  }

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const data = results.data as CSVRow[]
        setCsvData(data.filter(row => row.name && row.name.trim() !== ''))
        
        // Validate data
        const validationErrors: string[] = []
        data.forEach((row, index) => {
          if (!row.name) validationErrors.push(`Row ${index + 1}: Missing card name`)
          if (!row.set_name) validationErrors.push(`Row ${index + 1}: Missing set name`)
          if (!row.rarity) validationErrors.push(`Row ${index + 1}: Missing rarity`)
          if (!row.condition) validationErrors.push(`Row ${index + 1}: Missing condition`)
          if (!row.quantity || isNaN(parseInt(row.quantity))) {
            validationErrors.push(`Row ${index + 1}: Invalid quantity`)
          }
        })
        setErrors(validationErrors)
      },
      error: (error) => {
        setErrors([`CSV parsing error: ${error.message}`])
      }
    })
  }

  const handleUpload = async () => {
    if (csvData.length === 0) return

    setUploading(true)
    setProgress(0)

    try {
      const batchSize = 10
      const batches = []
      
      for (let i = 0; i < csvData.length; i += batchSize) {
        batches.push(csvData.slice(i, i + batchSize))
      }

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        const cardsToInsert = batch.map(row => ({
          name: row.name,
          set_name: row.set_name,
          card_number: row.card_number || null,
          rarity: row.rarity,
          condition: row.condition,
          quantity: parseInt(row.quantity),
          purchase_price: row.purchase_price ? parseFloat(row.purchase_price) : null,
          market_price: row.market_price ? parseFloat(row.market_price) : null,
          image_url: row.image_url || null,
          location: row.location || null,
          notes: row.notes || null
        }))

        const { error } = await supabase
          .from('cards')
          .insert(cardsToInsert)

        if (error) throw error

        setProgress(((i + 1) / batches.length) * 100)
      }

      onSuccess()
      resetForm()
    } catch (error) {
      console.error('Error uploading cards:', error)
      setErrors([`Upload error: ${error}`])
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setCsvData([])
    setProgress(0)
    setErrors([])
  }

  const downloadTemplate = () => {
    const template = `name,set_name,card_number,rarity,condition,quantity,purchase_price,market_price,image_url,location,notes
Charizard,Base Set,4/102,Rare Holo,Near Mint,1,300.00,350.00,https://images.pokemontcg.io/base1/4_hires.png,Binder 1,First edition
Pikachu,Base Set,58/102,Common,Near Mint,2,20.00,25.00,https://images.pokemontcg.io/base1/58_hires.png,Box A,Yellow cheeks variant`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pokemon-cards-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Upload Cards</DialogTitle>
          <DialogDescription>
            Upload multiple cards at once using a CSV file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Need a template?</p>
                <p className="text-sm text-blue-700">Download our CSV template to get started</p>
              </div>
            </div>
            <Button onClick={downloadTemplate} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csv-file">Upload CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
            <p className="text-sm text-gray-600">
              Select a CSV file with your Pokemon card data
            </p>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="font-medium text-red-900">Validation Errors</p>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.slice(0, 10).map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
                {errors.length > 10 && (
                  <li>• ... and {errors.length - 10} more errors</li>
                )}
              </ul>
            </div>
          )}

          {/* Preview */}
          {csvData.length > 0 && errors.length === 0 && (
            <div className="space-y-2">
              <p className="font-medium">Preview ({csvData.length} cards)</p>
              <div className="max-h-40 overflow-y-auto border rounded">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Set</th>
                      <th className="p-2 text-left">Rarity</th>
                      <th className="p-2 text-right">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.slice(0, 5).map((row, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{row.name}</td>
                        <td className="p-2">{row.set_name}</td>
                        <td className="p-2">{row.rarity}</td>
                        <td className="p-2 text-right">{row.quantity}</td>
                      </tr>
                    ))}
                    {csvData.length > 5 && (
                      <tr className="border-t">
                        <td colSpan={4} className="p-2 text-center text-gray-500">
                          ... and {csvData.length - 5} more cards
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading cards...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={csvData.length === 0 || errors.length > 0 || uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : `Upload ${csvData.length} Cards`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
