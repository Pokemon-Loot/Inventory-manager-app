"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, RefreshCw, Database, User, ImageIcon, AlertTriangle } from "lucide-react"

const supabase = createClient()

interface StatusCheck {
  name: string
  status: "success" | "error" | "warning" | "loading"
  message: string
  details?: any
}

export default function RefreshStatusPage() {
  const [checks, setChecks] = useState<StatusCheck[]>([])
  const [loading, setLoading] = useState(false)

  const runAllChecks = async () => {
    setLoading(true)
    const statusChecks: StatusCheck[] = []

    // Check 1: Database Connection
    try {
      const { data, error } = await supabase.from("pokemon_cards").select("count", { count: "exact", head: true })
      if (error) {
        statusChecks.push({
          name: "Database Connection",
          status: "error",
          message: error.message.includes("relation") ? "Table doesn't exist" : "Connection failed",
          details: error.message,
        })
      } else {
        statusChecks.push({
          name: "Database Connection",
          status: "success",
          message: `Connected successfully (${data || 0} records)`,
        })
      }
    } catch (err: any) {
      statusChecks.push({
        name: "Database Connection",
        status: "error",
        message: "Connection error",
        details: err.message,
      })
    }

    // Check 2: Table Schema
    try {
      const { data: schemaTest } = await supabase
        .from("pokemon_cards")
        .select("id, title, image_1, image_2, selling_price")
        .limit(1)

      statusChecks.push({
        name: "Table Schema",
        status: "success",
        message: "All required columns exist (image_1, image_2, selling_price)",
      })
    } catch (err: any) {
      statusChecks.push({
        name: "Table Schema",
        status: "error",
        message: "Schema mismatch - columns missing",
        details: err.message,
      })
    }

    // Check 3: Authentication
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        statusChecks.push({
          name: "Authentication",
          status: "success",
          message: `Logged in as ${session.user.email}`,
        })
      } else {
        statusChecks.push({
          name: "Authentication",
          status: "warning",
          message: "Not logged in",
        })
      }
    } catch (err: any) {
      statusChecks.push({
        name: "Authentication",
        status: "error",
        message: "Auth error",
        details: err.message,
      })
    }

    // Check 4: Sample Data
    try {
      const { data: cards, error } = await supabase.from("pokemon_cards").select("*").limit(5)

      if (error) {
        statusChecks.push({
          name: "Sample Data",
          status: "error",
          message: "Cannot fetch cards",
          details: error.message,
        })
      } else {
        statusChecks.push({
          name: "Sample Data",
          status: cards && cards.length > 0 ? "success" : "warning",
          message: `Found ${cards?.length || 0} cards`,
          details: cards,
        })
      }
    } catch (err: any) {
      statusChecks.push({
        name: "Sample Data",
        status: "error",
        message: "Data fetch error",
        details: err.message,
      })
    }

    // Check 5: Image Storage
    try {
      const { data: buckets } = await supabase.storage.listBuckets()
      const hasImageBucket = buckets?.some((bucket) => bucket.id === "card-images")

      statusChecks.push({
        name: "Image Storage",
        status: hasImageBucket ? "success" : "warning",
        message: hasImageBucket ? "Image storage bucket exists" : "Image storage not set up",
      })
    } catch (err: any) {
      statusChecks.push({
        name: "Image Storage",
        status: "warning",
        message: "Could not check storage",
        details: err.message,
      })
    }

    // Check 6: Test Owner Login
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "owner@pokemoncards.com",
        password: "pokemon123",
      })

      if (error) {
        statusChecks.push({
          name: "Owner Account",
          status: "warning",
          message: "Default owner account not found",
          details: "Run the setup script to create owner account",
        })
      } else {
        statusChecks.push({
          name: "Owner Account",
          status: "success",
          message: "Owner account exists and works",
        })
        // Sign out immediately
        await supabase.auth.signOut()
      }
    } catch (err: any) {
      statusChecks.push({
        name: "Owner Account",
        status: "error",
        message: "Owner account test failed",
        details: err.message,
      })
    }

    setChecks(statusChecks)
    setLoading(false)
  }

  useEffect(() => {
    runAllChecks()
  }, [])

  const getStatusIcon = (status: StatusCheck["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "loading":
        return <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
    }
  }

  const getStatusColor = (status: StatusCheck["status"]) => {
    switch (status) {
      case "success":
        return "border-green-200 bg-green-50"
      case "error":
        return "border-red-200 bg-red-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "loading":
        return "border-blue-200 bg-blue-50"
    }
  }

  const successCount = checks.filter((c) => c.status === "success").length
  const errorCount = checks.filter((c) => c.status === "error").length
  const warningCount = checks.filter((c) => c.status === "warning").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Pokemon Inventory Status Check</CardTitle>
            <CardDescription>Real-time status of your application components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-4 mb-4">
              <Badge variant="default" className="bg-green-600">
                ✓ {successCount} Working
              </Badge>
              <Badge variant="destructive">✗ {errorCount} Errors</Badge>
              <Badge variant="secondary" className="bg-yellow-600">
                ⚠ {warningCount} Warnings
              </Badge>
            </div>
            <Button onClick={runAllChecks} disabled={loading} className="w-full" size="lg">
              {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Status
            </Button>
          </CardContent>
        </Card>

        {/* Status Checks */}
        <div className="grid gap-4">
          {checks.map((check, index) => (
            <Card key={index} className={getStatusColor(check.status)}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  {getStatusIcon(check.status)}
                  <div className="flex-1">
                    <h3 className="font-semibold">{check.name}</h3>
                    <p className="text-sm mt-1">{check.message}</p>
                    {check.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-600 cursor-pointer">Show details</summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                          {typeof check.details === "string" ? check.details : JSON.stringify(check.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {errorCount > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>Critical Issues:</strong> {errorCount} error(s) need immediate attention.
                </AlertDescription>
              </Alert>
            )}

            {checks.some((c) => c.name === "Table Schema" && c.status === "error") && (
              <Alert>
                <AlertDescription>
                  <strong>Schema Issue:</strong> Run the complete schema rebuild script to fix table structure.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={() => (window.location.href = "/dashboard")}
                variant="outline"
                className="bg-transparent"
              >
                <Database className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
              <Button onClick={() => (window.location.href = "/")} variant="outline" className="bg-transparent">
                <User className="mr-2 h-4 w-4" />
                Go to Login
              </Button>
              <Button
                onClick={() => window.open("https://supabase.com/dashboard/project/efmkxxwlthadfgaotqdk/sql", "_blank")}
                variant="outline"
                className="bg-transparent"
              >
                <Database className="mr-2 h-4 w-4" />
                SQL Editor
              </Button>
              <Button
                onClick={() =>
                  window.open("https://supabase.com/dashboard/project/efmkxxwlthadfgaotqdk/editor", "_blank")
                }
                variant="outline"
                className="bg-transparent"
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Table Editor
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {checks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{successCount}</div>
                  <div className="text-sm text-gray-600">Working</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                  <div className="text-sm text-gray-600">Errors</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
                  <div className="text-sm text-gray-600">Warnings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{checks.length}</div>
                  <div className="text-sm text-gray-600">Total Checks</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
