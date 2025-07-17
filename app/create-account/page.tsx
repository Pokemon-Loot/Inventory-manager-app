"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Copy, ExternalLink, User, Database, ArrowRight } from "lucide-react"
import { AccountTest } from "@/components/account-test"

export default function CreateAccountPage() {
  const [step, setStep] = useState(1)
  const [copied, setCopied] = useState(false)

  const projectRef = "efmkxxwlthadfgaotqdk"
  const dashboardUrl = `https://supabase.com/dashboard/project/${projectRef}`
  const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql`

  const sqlScript = `-- Create owner account for Pokemon Card Inventory
-- Project: ${projectRef}
-- Run this in your Supabase SQL Editor

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'owner@pokemoncards.com',
  crypt('pokemon123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"is_owner": true}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'owner@pokemoncards.com'),
  format('{"sub": "%s", "email": "%s"}', (SELECT id FROM auth.users WHERE email = 'owner@pokemoncards.com'), 'owner@pokemoncards.com')::jsonb,
  'email',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (provider, user_id) DO NOTHING;`

  const copyScript = () => {
    navigator.clipboard.writeText(sqlScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create Owner Account</CardTitle>
            <CardDescription>
              Project: <code className="bg-gray-100 px-2 py-1 rounded">{projectRef}</code>
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Step 1 */}
        <Card className={step >= 1 ? "border-blue-500 shadow-md" : "border-gray-200"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center font-bold">
                1
              </div>
              Open Your Supabase SQL Editor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <Database className="h-4 w-4" />
              <AlertDescription>
                <strong>Direct link to your SQL Editor:</strong>
                <br />
                <code className="text-xs">{sqlEditorUrl}</code>
              </AlertDescription>
            </Alert>

            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                window.open(sqlEditorUrl, "_blank")
                setStep(2)
              }}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open SQL Editor for Project {projectRef}
            </Button>

            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p>• Click "New Query" in the SQL Editor</p>
              <p>
                • Make sure you're in the correct project: <strong>{projectRef}</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Step 2 */}
        <Card className={step >= 2 ? "border-blue-500 shadow-md" : "border-gray-200"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center font-bold">
                2
              </div>
              Run the Account Creation Script
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>Copy this entire script and paste it into your SQL Editor:</strong>
                </AlertDescription>
              </Alert>

              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto max-h-80 border">
                  <code>{sqlScript}</code>
                </pre>
                <Button className="absolute top-2 right-2" size="sm" onClick={copyScript}>
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy Script"}
                </Button>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ArrowRight className="h-4 w-4" />
                <span>After pasting, click the "Run" button in Supabase</span>
              </div>

              <Button
                className="w-full bg-transparent"
                variant="outline"
                size="lg"
                onClick={() => setStep(3)}
                disabled={step < 2}
              >
                <Database className="mr-2 h-4 w-4" />
                I've Run the Script Successfully
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Step 3 */}
        <Card className={step >= 3 ? "border-green-500 shadow-md" : "border-gray-200"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white text-sm flex items-center justify-center font-bold">
                3
              </div>
              Test Your Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <User className="h-4 w-4" />
              <AlertDescription>
                <strong>Your login credentials:</strong>
                <br />
                <span className="font-mono">Email: owner@pokemoncards.com</span>
                <br />
                <span className="font-mono">Password: pokemon123</span>
              </AlertDescription>
            </Alert>

            {step >= 3 && <AccountTest />}

            <div className="mt-6 space-y-2">
              <Button className="w-full" size="lg" onClick={() => (window.location.href = "/")}>
                <ArrowRight className="mr-2 h-4 w-4" />
                Go to Login Page
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => window.open(dashboardUrl, "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Project Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {step >= 3 && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Setup Complete!</strong> Your owner account has been created. Test it above, then go to the login
              page to start managing your Pokemon cards!
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
