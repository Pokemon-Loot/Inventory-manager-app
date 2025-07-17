"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Database, User, AlertTriangle } from "lucide-react"

interface DiagnosticResult {
  check: string
  status: "success" | "error" | "warning"
  message: string
  details?: any
}

export default function DiagnosePage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<DiagnosticResult[]>([])

  const runDiagnostics = async () => {
    setLoading(true)
    const diagnostics: DiagnosticResult[] = []

    try {
      // Check 1: Supabase connection
      try {
        const { data, error } = await supabase.from("pokemon_cards").select("count", { count: "exact", head: true })
        if (error) {
          if (error.message.includes("relation") && error.message.includes("does not exist")) {
            diagnostics.push({
              check: "Database Tables",
              status: "warning",
              message: "pokemon_cards table doesn't exist - needs to be created",
              details: error.message,
            })
          } else {
            diagnostics.push({
              check: "Database Connection",
              status: "error",
              message: "Database connection failed",
              details: error.message,
            })
          }
        } else {
          diagnostics.push({
            check: "Database Connection",
            status: "success",
            message: "Successfully connected to Supabase",
            details: `Table exists with ${data || 0} records`,
          })
        }
      } catch (err: any) {
        diagnostics.push({
          check: "Database Connection",
          status: "error",
          message: "Connection error",
          details: err.message,
        })
      }

      // Check 2: Try to sign in with existing credentials
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: "owner@pokemoncards.com",
          password: "pokemon123",
        })

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            diagnostics.push({
              check: "Owner Account",
              status: "warning",
              message: "Owner account doesn't exist - needs to be created",
              details: error.message,
            })
          } else {
            diagnostics.push({
              check: "Owner Account",
              status: "error",
              message: "Authentication error",
              details: error.message,
            })
          }
        } else {
          // Sign out immediately after test
          await supabase.auth.signOut()
          diagnostics.push({
            check: "Owner Account",
            status: "success",
            message: "Owner account exists and login works",
            details: `User ID: ${data.user?.id}`,
          })
        }
      } catch (err: any) {
        diagnostics.push({
          check: "Owner Account",
          status: "error",
          message: "Auth test failed",
          details: err.message,
        })
      }

      // Check 3: Environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        diagnostics.push({
          check: "Environment Variables",
          status: "error",
          message: "Missing environment variables",
          details: `URL: ${!!supabaseUrl}, Key: ${!!supabaseKey}`,
        })
      } else if (!supabaseUrl.includes("efmkxxwlthadfgaotqdk")) {
        diagnostics.push({
          check: "Environment Variables",
          status: "warning",
          message: "URL doesn't match your project",
          details: `Expected: efmkxxwlthadfgaotqdk, Got: ${supabaseUrl}`,
        })
      } else {
        diagnostics.push({
          check: "Environment Variables",
          status: "success",
          message: "Environment variables are correctly set",
          details: `Project: efmkxxwlthadfgaotqdk`,
        })
      }

      setResults(diagnostics)
    } catch (error: any) {
      diagnostics.push({
        check: "General Error",
        status: "error",
        message: "Unexpected error during diagnostics",
        details: error.message,
      })
      setResults(diagnostics)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusColor = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return "border-green-200 bg-green-50"
      case "error":
        return "border-red-200 bg-red-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Supabase Project Diagnostics</CardTitle>
            <CardDescription>
              Check what's already in your project: <Badge variant="outline">efmkxxwlthadfgaotqdk</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runDiagnostics} disabled={loading} className="w-full" size="lg">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Database className="mr-2 h-4 w-4" />
              Run Diagnostics
            </Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Diagnostic Results</h2>

            {results.map((result, index) => (
              <Card key={index} className={getStatusColor(result.status)}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <h3 className="font-semibold">{result.check}</h3>
                      <p className="text-sm mt-1">{result.message}</p>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-600 cursor-pointer">Show details</summary>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                            {typeof result.details === "string"
                              ? result.details
                              : JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Recommended Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {results.some((r) => r.check === "Database Tables" && r.status === "warning") && (
                  <Alert>
                    <AlertDescription>
                      <strong>1. Create Database Tables:</strong> Run the clean setup script to create the pokemon_cards
                      table.
                    </AlertDescription>
                  </Alert>
                )}

                {results.some((r) => r.check === "Owner Account" && r.status === "warning") && (
                  <Alert>
                    <AlertDescription>
                      <strong>2. Create Owner Account:</strong> The owner account needs to be created in Supabase Auth.
                    </AlertDescription>
                  </Alert>
                )}

                {results.some((r) => r.status === "error") && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <strong>3. Fix Errors:</strong> Address the errors shown above before proceeding.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2 pt-2">
                  <Button onClick={() => (window.location.href = "/clean-setup")} className="flex-1">
                    Clean Setup
                  </Button>
                  <Button
                    onClick={() => (window.location.href = "/")}
                    variant="outline"
                    className="flex-1 bg-transparent"
                  >
                    Back to Login
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
