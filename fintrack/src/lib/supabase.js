import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ldaymbzdmmuatafbuadg.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkYXltYnpkbW11YXRhZmJ1YWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMzUzODcsImV4cCI6MjA5MzkxMTM4N30.XXjG6tQZWi38TujhCDDIvlWL_s_eci-RY1TZn45imiY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
