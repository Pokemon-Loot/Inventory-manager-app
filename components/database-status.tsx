"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, Database } from "lucide-react"

export function DatabaseStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "error" | "needs-setup">("checking")
  const [error, setError] = useState("")

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      // First check if we can connect to Supabase
      const { data: connectionTest, error: connectionError } = await supabase
        .from("pokemon_cards")
        .select("count", { count: "exact", head: true })

      if (connectionError) {
        if (connectionError.message.includes("relation") && connectionError.message.includes("does not exist")) {
          setStatus("needs-setup")
          setError("Database tables not found. Please run the setup script.")
        } else {
          setStatus("error")
          setError(connectionError.message)
        }
      } else {
        setStatus("connected")
      }
    } catch (err: any) {
      setStatus("error")
      setError(err.message)
    }
  }

  if (status === "checking") {
    return (
      <Alert>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription>Checking database connection...</AlertDescription>
      </Alert>
    )
  }

  if (status === "needs-setup") {
    return (
      <Alert variant="destructive">
        <Database className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p>
              <strong>Database Setup Required:</strong>
            </p>
            <p>Please run the database setup script in your Supabase SQL editor:</p>
            <code className="block bg-gray-100 p-2 rounded text-xs mt-2">scripts/001-simplified-setup.sql</code>
            <Button size="sm" className="mt-2" onClick={checkConnection}>
              Check Again
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (status === "error") {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p>
              <strong>Database connection failed:</strong>
            </p>
            <p className="text-sm font-mono">{error}</p>
            <Button size="sm" variant="outline" onClick={checkConnection}>
              Retry Connection
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        <strong>Database connected successfully!</strong> Ready to manage your Pokemon cards.
      </AlertDescription>
    </Alert>
  )
}
