"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export function AccountTest() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<"success" | "error" | null>(null)
  const [message, setMessage] = useState("")

  const testAccount = async () => {
    setTesting(true)
    setResult(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "owner@pokemoncards.com",
        password: "pokemon123",
      })

      if (error) {
        setResult("error")
        setMessage(error.message)
      } else {
        setResult("success")
        setMessage("Account exists and login works!")
        // Sign out immediately after test
        await supabase.auth.signOut()
      }
    } catch (err: any) {
      setResult("error")
      setMessage(err.message)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={testAccount} disabled={testing} className="w-full">
        {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Test Account Login
      </Button>

      {result === "success" && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Success!</strong> {message}
          </AlertDescription>
        </Alert>
      )}

      {result === "error" && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
