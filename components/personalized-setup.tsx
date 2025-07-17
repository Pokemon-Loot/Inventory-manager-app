"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Copy, ExternalLink, Database, Key } from "lucide-react"

export function PersonalizedSetup() {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const projectRef = "efmkxxwlthadfgaotqdk"
  const supabaseUrl = `https://${projectRef}.supabase.co`

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Your Supabase Project Setup
          </CardTitle>
          <CardDescription>
            Project: <Badge variant="outline">{projectRef}</Badge>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Step 1: Environment Variables
          </CardTitle>
          <CardDescription>Make sure these are set in your project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>Your Supabase URL:</strong>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded border">
              <code className="text-sm">NEXT_PUBLIC_SUPABASE_URL={supabaseUrl}</code>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(supabaseUrl, "url")}>
                {copied === "url" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-600">
              Get your ANON KEY from: Dashboard → Settings → API → Project API keys
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => window.open(`https://supabase.com/dashboard/project/${projectRef}/settings/api`, "_blank")}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open API Settings
          </Button>
        </CardContent>
      </Card>

      {/* Database Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Step 2: Database Setup
          </CardTitle>
          <CardDescription>Create the tables and owner account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>Go to SQL Editor:</strong> Dashboard → SQL Editor → New Query
            </AlertDescription>
          </Alert>

          <Button
            className="w-full"
            onClick={() => window.open(`https://supabase.com/dashboard/project/${projectRef}/sql`, "_blank")}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open SQL Editor
          </Button>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">Run these scripts in order:</p>
            <ol className="text-sm space-y-1">
              <li>
                1. Database tables: <code>scripts/001-simplified-setup.sql</code>
              </li>
              <li>
                2. Owner account: <code>scripts/004-create-auth-user.sql</code>
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links for Your Project</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-auto p-4 bg-transparent"
            onClick={() => window.open(`https://supabase.com/dashboard/project/${projectRef}`, "_blank")}
          >
            <div className="text-left">
              <div className="font-semibold">Project Dashboard</div>
              <div className="text-sm text-gray-600">Main project overview</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 bg-transparent"
            onClick={() => window.open(`https://supabase.com/dashboard/project/${projectRef}/auth/users`, "_blank")}
          >
            <div className="text-left">
              <div className="font-semibold">Authentication</div>
              <div className="text-sm text-gray-600">Manage users</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 bg-transparent"
            onClick={() => window.open(`https://supabase.com/dashboard/project/${projectRef}/editor`, "_blank")}
          >
            <div className="text-left">
              <div className="font-semibold">Table Editor</div>
              <div className="text-sm text-gray-600">View your data</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 bg-transparent"
            onClick={() => window.open(`https://supabase.com/dashboard/project/${projectRef}/sql`, "_blank")}
          >
            <div className="text-left">
              <div className="font-semibold">SQL Editor</div>
              <div className="text-sm text-gray-600">Run SQL scripts</div>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
