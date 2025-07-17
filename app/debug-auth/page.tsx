"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DebugAuthPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const runTests = async () => {
    setLoading(true)
    const testResults = []

    // Test 1: Check environment variables
    testResults.push({
      test: "Environment Variables",
      result: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing",
        urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL,
      },
    })

    // Test 2: Try to get session
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      testResults.push({
        test: "Current Session",
        result: sessionError ? `❌ ${sessionError.message}` : sessionData.session ? "✅ Logged in" : "ℹ️ No session",
      })
    } catch (err: any) {
      testResults.push({
        test: "Current Session",
        result: `❌ Error: ${err.message}`,
      })
    }

    // Test 3: Try to sign in with test credentials
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: "owner@pokemoncards.com",
        password: "pokemon123",
      })

      if (signInError) {
        testResults.push({
          test: "Test Login",
          result: `❌ ${signInError.message}`,
          details: signInError,
        })
      } else {
        testResults.push({
          test: "Test Login",
          result: "✅ Success",
          details: { userId: signInData.user?.id, email: signInData.user?.email },
        })
        // Sign out immediately
        await supabase.auth.signOut()
      }
    } catch (err: any) {
      testResults.push({
        test: "Test Login",
        result: `❌ Error: ${err.message}`,
      })
    }

    // Test 4: Check if we can access the database
    try {
      const { data: dbData, error: dbError } = await supabase
        .from("pokemon_cards")
        .select("count", { count: "exact", head: true })

      testResults.push({
        test: "Database Access",
        result: dbError ? `❌ ${dbError.message}` : `✅ Connected (${dbData || 0} records)`,
      })
    } catch (err: any) {
      testResults.push({
        test: "Database Access",
        result: `❌ Error: ${err.message}`,
      })
    }

    setResults(testResults)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={runTests} disabled={loading} className="w-full">
              {loading ? "Running Tests..." : "Run Authentication Tests"}
            </Button>
          </CardContent>
        </Card>

        {results.map((result, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{result.test}</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  <div className="font-mono text-sm">
                    {typeof result.result === "string" ? result.result : JSON.stringify(result.result, null, 2)}
                  </div>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="cursor-pointer">Show Details</summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
