// =================================================================
// SUPABASE CLIENT
// Replaces: firebaseConfig.ts
// Uses environment variables for security.
// Create a .env.local file with your actual Supabase credentials.
// =================================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. ' +
        'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
