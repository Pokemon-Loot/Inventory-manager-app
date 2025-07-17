"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Copy, ExternalLink, Database, AlertTriangle } from "lucide-react"

export default function CleanSetupPage() {
  const [copied, setCopied] = useState(false)

  const projectRef = "efmkxxwlthadfgaotqdk"
  const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql`

  const cleanSetupScript = `-- Clean setup script that handles existing data safely
-- This will work even if you have existing tables or users

-- Check what exists first
DO $$
BEGIN
    RAISE NOTICE 'Checking existing data...';
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pokemon_cards') THEN
        RAISE NOTICE 'pokemon_cards table exists - will update if needed';
    ELSE
        RAISE NOTICE 'pokemon_cards table does not exist - will create';
    END IF;
    
    IF EXISTS (SELECT FROM auth.users WHERE email = 'owner@pokemoncards.com') THEN
        RAISE NOTICE 'User owner@pokemoncards.com already exists - will update password';
    ELSE
        RAISE NOTICE 'User owner@pokemoncards.com does not exist - will create';
    END IF;
END $$;

-- Create pokemon_cards table (safe with IF NOT EXISTS)
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

-- Create indexes safely
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_user_id ON pokemon_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_sku ON pokemon_cards(sku);
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_category ON pokemon_cards(category, sub_category);

-- Enable RLS
ALTER TABLE pokemon_cards ENABLE ROW LEVEL SECURITY;

-- Recreate policies (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own cards" ON pokemon_cards;
DROP POLICY IF EXISTS "Users can insert their own cards" ON pokemon_cards;
DROP POLICY IF EXISTS "Users can update their own cards" ON pokemon_cards;
DROP POLICY IF EXISTS "Users can delete their own cards" ON pokemon_cards;

CREATE POLICY "Users can view their own cards" ON pokemon_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own cards" ON pokemon_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cards" ON pokemon_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cards" ON pokemon_cards FOR DELETE USING (auth.uid() = user_id);

-- Handle user creation/update safely
DO $$
DECLARE
    user_id uuid;
    existing_user_id uuid;
BEGIN
    -- Check if user exists
    SELECT id INTO existing_user_id FROM auth.users WHERE email = 'owner@pokemoncards.com';
    
    IF existing_user_id IS NOT NULL THEN
        -- Update existing user
        UPDATE auth.users 
        SET 
            encrypted_password = crypt('pokemon123', gen_salt('bf')),
            updated_at = now(),
            email_confirmed_at = COALESCE(email_confirmed_at, now())
        WHERE email = 'owner@pokemoncards.com';
        
        user_id := existing_user_id;
        RAISE NOTICE 'Updated existing user: %', user_id;
    ELSE
        -- Create new user
        user_id := gen_random_uuid();
        
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password,
            email_confirmed_at, created_at, updated_at,
            raw_app_meta_data, raw_user_meta_data
        ) VALUES (
            user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'owner@pokemoncards.com', crypt('pokemon123', gen_salt('bf')),
            now(), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"is_owner":true}'
        );
        
        RAISE NOTICE 'Created new user: %', user_id;
    END IF;
    
    -- Handle identity (recreate to avoid conflicts)
    DELETE FROM auth.identities WHERE user_id = user_id AND provider = 'email';
    
    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), user_id,
        format('{"sub":"%s","email":"%s"}', user_id, 'owner@pokemoncards.com')::jsonb,
        'email', now(), now()
    );
    
    RAISE NOTICE 'Identity updated for user';
END $$;

-- Verification
SELECT 'SUCCESS: User ready' as status, id, email, email_confirmed_at IS NOT NULL as confirmed
FROM auth.users WHERE email = 'owner@pokemoncards.com';`

  const copyScript = () => {
    navigator.clipboard.writeText(cleanSetupScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Clean Setup</CardTitle>
            <CardDescription>
              Safe setup that handles existing data in project: <code>efmkxxwlthadfgaotqdk</code>
            </CardDescription>
          </CardHeader>
        </Card>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>This script is safe to run multiple times.</strong> It will:
            <br />• Create tables only if they don't exist
            <br />• Update existing user password if user exists
            <br />• Create new user if user doesn't exist
            <br />• Handle all conflicts automatically
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Step 1: Open SQL Editor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full" size="lg" onClick={() => window.open(sqlEditorUrl, "_blank")}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Open SQL Editor for {projectRef}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5" />
              Step 2: Run Clean Setup Script
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto max-h-96 border">
                <code>{cleanSetupScript}</code>
              </pre>
              <Button className="absolute top-2 right-2" size="sm" onClick={copyScript}>
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy Script"}
              </Button>
            </div>

            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>After running the script:</strong>
                <br />• Look for "SUCCESS: User ready" message
                <br />• Check that confirmed = true
                <br />• Then try logging in with owner@pokemoncards.com / pokemon123
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button
                onClick={() => (window.location.href = "/diagnose")}
                variant="outline"
                className="flex-1 bg-transparent"
              >
                Run Diagnostics First
              </Button>
              <Button onClick={() => (window.location.href = "/")} className="flex-1">
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
