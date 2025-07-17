import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://efmkxxwlthadfgaotqdk.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmbWt4eHdsdGhhZGZnYW90cWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2ODMzOTYsImV4cCI6MjA2ODI1OTM5Nn0.eqaswgWu7TnmkVfxsugdFOnkVPcBUOsnKje-J9I898M"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type PokemonCard = {
  id: string
  category: string
  sub_category: string
  title: string
  description?: string
  quantity: number
  type: string
  price: number // Listing/asking price
  shipping_profile?: string
  condition: string
  selling_price?: number // Make this optional to handle existing data
  sku?: string
  image_1?: string // Updated column name
  image_2?: string // Updated column name
  user_id: string
  created_at: string
  updated_at: string
}
