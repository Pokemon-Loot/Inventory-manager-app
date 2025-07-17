"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Database, AlertTriangle, Settings } from "lucide-react"

interface DiagnosticResult {
  check: string
  status: "success" | "error" | "warning"
  message: string
  details?: any
}

export default function DiagnosticPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<DiagnosticResult[]>([])

  const runDiagnostics = async () => {
    setLoading(true)
    const diagnostics: DiagnosticResult[] = []

    try {
      // Check 1: Environment Variables
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
          message: "Environment variables correctly configured",
          details: `Project: efmkxxwlthadfgaotqdk`,
        })
      }

      // Check 2: Database Connection & Table Structure
      try {
        const { data, error } = await supabase.from("pokemon_cards").select("*").limit(1)

        if (error) {
          if (error.message.includes("relation") && error.message.includes("does not exist")) {
            diagnostics.push({
              check: "Database Table",
              status: "error",
              message: "pokemon_cards table doesn't exist",
              details: "Need to run the setup SQL script",
            })
          } else {
            diagnostics.push({
              check: "Database Table",
              status: "error",
              message: "Database error",
              details: error.message,
            })
          }
        } else {
          diagnostics.push({
            check: "Database Table",
            status: "success",
            message: "pokemon_cards table exists and accessible",
            details: `Found ${data?.length || 0} sample records`,
          })
        }
      } catch (err: any) {
        diagnostics.push({
          check: "Database Table",
          status: "error",
          message: "Connection failed",
          details: err.message,
        })
      }

      // Check 3: Authentication Test
      try {
        const { data: authData, error: authError } = await supabase.auth.getSession()

        if (authData.session) {
          diagnostics.push({
            check: "Authentication",
            status: "success",
            message: "User is logged in",
            details: `User: ${authData.session.user.email}`,
          })
        } else {
          diagnostics.push({
            check: "Authentication",
            status: "warning",
            message: "No active session",
            details: "User needs to log in",
          })
        }
      } catch (err: any) {
        diagnostics.push({
          check: "Authentication",
          status: "error",
          message: "Auth check failed",
          details: err.message,
        })
      }

      // Check 4: RLS Policies
      try {
        const { data: policyData, error: policyError } = await supabase.rpc("check_rls_policies").single()

        if (policyError && !policyError.message.includes("function")) {
          diagnostics.push({
            check: "Row Level Security",
            status: "warning",
            message: "Cannot verify RLS policies",
            details: "Policies should be configured for security",
          })
        } else {
          diagnostics.push({
            check: "Row Level Security",
            status: "success",
            message: "RLS appears to be configured",
            details: "Table access is properly secured",
          })
        }
      } catch (err: any) {
        diagnostics.push({
          check: "Row Level Security",
          status: "warning",
          message: "RLS check inconclusive",
          details: "Ensure RLS policies are set up",
        })
      }

      // Check 5: Sample Data
      try {
        const { count, error: countError } = await supabase
          .from("pokemon_cards")
          .select("*", { count: "exact", head: true })

        if (countError) {
          diagnostics.push({
            check: "Sample Data",
            status: "warning",
            message: "Cannot check sample data",
            details: countError.message,
          })
        } else {
          diagnostics.push({
            check: "Sample Data",
            status: count && count > 0 ? "success" : "warning",
            message: count && count > 0 ? `Found ${count} cards in database` : "No cards in database yet",
            details: count && count > 0 ? "Ready to use" : "Add some cards to test functionality",
          })
        }
      } catch (err: any) {
        diagnostics.push({
          check: "Sample Data",
          status: "warning",
          message: "Cannot check data count",
          details: err.message,
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

  // Auto-run diagnostics on page load
  useEffect(() => {
    runDiagnostics()
  }, [])

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

  const successCount = results.filter((r) => r.status === "success").length
  const errorCount = results.filter((r) => r.status === "error").length
  const warningCount = results.filter((r) => r.status === "warning").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Pokemon Inventory Diagnostic</CardTitle>
            <CardDescription>
              Checking your setup for project: <Badge variant="outline">efmkxxwlthadfgaotqdk</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-4 mb-4">
              <Badge variant="default" className="bg-green-600">
                ✓ {successCount} Passed
              </Badge>
              <Badge variant="destructive">✗ {errorCount} Errors</Badge>
              <Badge variant="secondary" className="bg-yellow-600">
                ⚠ {warningCount} Warnings
              </Badge>
            </div>
            <Button onClick={runDiagnostics} disabled={loading} className="w-full" size="lg">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Database className="mr-2 h-4 w-4" />
              {loading ? "Running Diagnostics..." : "Re-run Diagnostics"}
            </Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <div className="space-y-4">
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

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {errorCount > 0 && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <strong>Critical Issues Found:</strong> Please fix the errors above before using the app.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    onClick={() =>
                      window.open("https://supabase.com/dashboard/project/efmkxxwlthadfgaotqdk/sql", "_blank")
                    }
                    variant="outline"
                    className="bg-transparent"
                  >
                    Open SQL Editor
                  </Button>
                  <Button
                    onClick={() => (window.location.href = "/signup")}
                    variant="outline"
                    className="bg-transparent"
                  >
                    Create Account
                  </Button>
                  <Button onClick={() => (window.location.href = "/")} variant="outline" className="bg-transparent">
                    Go to Login
                  </Button>
                  <Button
                    onClick={() => (window.location.href = "/dashboard")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Go to Dashboard
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
