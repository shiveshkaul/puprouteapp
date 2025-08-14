import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

const supabaseUrl = 'https://bagpfxikrcjlajsqfjwg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZ3BmeGlrcmNqbGFqc3FmandnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMDYyNzAsImV4cCI6MjA3MDY4MjI3MH0.TFUeGE11leZQymFTByfq2dFZrbr2R70ijxgzsK9qgl4'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})
