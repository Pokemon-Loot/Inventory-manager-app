"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Copy, ExternalLink, Database, Key, User } from "lucide-react"

export function SetupGuide() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null)

  const copyToClipboard = (text: string, stepNumber: number) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(stepNumber)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const sqlScript = `-- Pokemon Card Inventory Database Setup
-- Run this in your Supabase SQL Editor

-- Create pokemon_cards table
CREATE TABLE IF NOT EXISTS pokemon_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'Trading Card Games',
  sub_category TEXT NOT NULL DEFAULT 'Pokémon Cards',
  title TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  type TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  shipping_profile TEXT,
  offerable BOOLEAN DEFAULT TRUE,
  hazmat BOOLEAN DEFAULT FALSE,
  condition TEXT NOT NULL DEFAULT 'Near Mint',
  cost_per_item DECIMAL(10,2) DEFAULT 0.00,
  sku TEXT UNIQUE,
  image_url_1 TEXT,
  image_url_2 TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_user_id ON pokemon_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_sku ON pokemon_cards(sku);
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_category ON pokemon_cards(category, sub_category);

-- Enable Row Level Security (RLS)
ALTER TABLE pokemon_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own cards" ON pokemon_cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cards" ON pokemon_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cards" ON pokemon_cards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cards" ON pokemon_cards
  FOR DELETE USING (auth.uid() = user_id);`

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Pokemon Inventory Setup Guide
          </CardTitle>
          <CardDescription>
            Complete setup for your Supabase project: <Badge variant="outline">supabase-inventory-poke</Badge>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Step 1: Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Step 1: Configure Environment Variables
          </CardTitle>
          <CardDescription>Add your Supabase credentials to the project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>Go to your Supabase project dashboard:</strong>
              <br />
              1. Visit{" "}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                supabase.com/dashboard <ExternalLink className="h-3 w-3" />
              </a>
              <br />
              2. Select your project: <strong>supabase-inventory-poke</strong>
              <br />
              3. Go to <strong>Settings → API</strong>
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">Your environment variables should look like:</p>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex items-center justify-between bg-white p-2 rounded border">
                <span>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</span>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard("NEXT_PUBLIC_SUPABASE_URL=", 1)}>
                  {copiedStep === 1 ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex items-center justify-between bg-white p-2 rounded border">
                <span>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard("NEXT_PUBLIC_SUPABASE_ANON_KEY=", 1)}
                >
                  {copiedStep === 1 ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Database Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Step 2: Setup Database Tables
          </CardTitle>
          <CardDescription>Run the SQL script to create the necessary tables</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>In your Supabase dashboard:</strong>
              <br />
              1. Go to <strong>SQL Editor</strong>
              <br />
              2. Click <strong>New Query</strong>
              <br />
              3. Copy and paste the script below
              <br />
              4. Click <strong>Run</strong>
            </AlertDescription>
          </Alert>

          <div className="relative">
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto max-h-96">
              <code>{sqlScript}</code>
            </pre>
            <Button className="absolute top-2 right-2" size="sm" onClick={() => copyToClipboard(sqlScript, 2)}>
              {copiedStep === 2 ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedStep === 2 ? "Copied!" : "Copy SQL"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Create Owner Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Step 3: Create Owner Account
          </CardTitle>
          <CardDescription>Set up your login credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>Two options to create your owner account:</strong>
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Option A: Use Setup Page</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">Automated account creation through the app</p>
                <Button className="w-full" onClick={() => (window.location.href = "/setup")}>
                  Go to Setup Page
                </Button>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-lg">Option B: Manual Creation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">Create account directly in Supabase dashboard</p>
                <ol className="text-sm space-y-1 mb-3">
                  <li>1. Go to Authentication → Users</li>
                  <li>2. Click "Add user"</li>
                  <li>3. Use: owner@pokemoncards.com</li>
                  <li>4. Password: pokemon123</li>
                </ol>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
                >
                  Open Supabase Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="font-semibold text-blue-800 mb-2">Default Login Credentials:</p>
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span>Email: owner@pokemoncards.com</span>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard("owner@pokemoncards.com", 3)}>
                  {copiedStep === 3 ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span>Password: pokemon123</span>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard("pokemon123", 3)}>
                  {copiedStep === 3 ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 4: Test the App */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Step 4: Test Your Setup
          </CardTitle>
          <CardDescription>Verify everything is working correctly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button className="w-full" onClick={() => (window.location.href = "/")}>
              Go to Login Page
            </Button>
            <p className="text-sm text-gray-600 text-center">
              You should see a green "Database connected successfully!" message
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
