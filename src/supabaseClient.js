import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ntmnnifsdtrmeoiowrlm.supabase.co'
const supabaseAnonKey = 'sb_publishable_-RwP5uBx-MtuC4Id9LDLZg_hdKajKVE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
