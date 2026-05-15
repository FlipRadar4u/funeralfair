import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lgqgviyqqubjvuansump.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWd2aXlxcXVianZ1YW5zdW1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NDk0NjQsImV4cCI6MjA5NDMyNTQ2NH0.BvIyZUKeCjPhqqM9oJRM5NU6nRJYZrZLBBX4X6eXdCg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
})
