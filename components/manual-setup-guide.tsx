"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, User, Copy, CheckCircle } from "lucide-react"
import { useState } from "react"

export function ManualSetupGuide() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null)

  const copyToClipboard = (text: string, stepNumber: number) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(stepNumber)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Manual Account Setup
        </CardTitle>
        <CardDescription>Create your owner account directly in Supabase Dashboard</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            <strong>If the automatic setup doesn't work, follow these steps:</strong>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Step 1: Open Supabase Dashboard</h3>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Supabase Dashboard
            </Button>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Step 2: Navigate to Authentication</h3>
            <p className="text-sm text-gray-600 mb-2">
              1. Select your project: <Badge variant="outline">supabase-inventory-poke</Badge>
            </p>
            <p className="text-sm text-gray-600 mb-2">2. Go to Authentication → Users</p>
            <p className="text-sm text-gray-600">3. Click "Add user" button</p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Step 3: Create User Account</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="font-mono text-sm">owner@pokemoncards.com</span>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard("owner@pokemoncards.com", 1)}>
                  {copiedStep === 1 ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="font-mono text-sm">pokemon123</span>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard("pokemon123", 2)}>
                  {copiedStep === 2 ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Make sure "Auto Confirm User" is checked if you don't want to deal with email confirmation
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Step 4: Test Login</h3>
            <Button className="w-full" onClick={() => (window.location.href = "/")}>
              Go to Login Page
            </Button>
          </div>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800">
            <strong>Pro Tip:</strong> If you're still having issues, check your Supabase project settings:
            <br />• Authentication → Settings → Disable email confirmations for testing
            <br />• Make sure your environment variables are correctly set
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
