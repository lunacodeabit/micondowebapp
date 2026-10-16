// =================================================================
// SUPABASE CLIENT
// Replaces: firebaseConfig.ts
// Uses environment variables for security.
// Create a .env.local file with your actual Supabase credentials.
// =================================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kttrzritomsfnqfwiplv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0dHJ6cml0b21zZm5xZndpcGx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDEwMDcsImV4cCI6MjA4NzE3NzAwN30.KtXcoW5XWN-erBrMRTtCgJ96AG6Rxjounkciab8q7No';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

