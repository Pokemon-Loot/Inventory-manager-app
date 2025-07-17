"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"

export function EnvironmentChecker() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const hasUrl = !!supabaseUrl
  const hasKey = !!supabaseKey
  const urlValid = hasUrl && supabaseUrl.includes("supabase.co")
  const keyValid = hasKey && supabaseKey.length > 50

  const allGood = hasUrl && hasKey && urlValid && keyValid

  if (allGood) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Environment configured correctly!</strong>
          <br />
          <Badge variant="outline" className="mt-1">
            {supabaseUrl?.split("//")[1]?.split(".")[0]}
          </Badge>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant="destructive">
      <XCircle className="h-4 w-4" />
      <AlertDescription>
        <strong>Environment configuration issues:</strong>
        <ul className="mt-2 space-y-1 text-sm">
          {!hasUrl && <li>• Missing NEXT_PUBLIC_SUPABASE_URL</li>}
          {!hasKey && <li>• Missing NEXT_PUBLIC_SUPABASE_ANON_KEY</li>}
          {hasUrl && !urlValid && <li>• Invalid Supabase URL format</li>}
          {hasKey && !keyValid && <li>• Invalid Supabase key format</li>}
        </ul>
        <p className="mt-2 text-sm">
          <strong>Please check your environment variables!</strong>
        </p>
      </AlertDescription>
    </Alert>
  )
}
