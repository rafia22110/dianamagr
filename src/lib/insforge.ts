import { createClient } from '@insforge/sdk';

const supabaseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || '';

export const insforge = createClient({
  baseUrl: supabaseUrl,
  anonKey: supabaseAnonKey,
});

/**
 * 🛡️ Sentinel Security Note:
 * This client uses the anonymous key and is exposed to the browser.
 * Ensure that the 'images' table and 'diana-images' bucket have strict
 * Row Level Security (RLS) policies or IAM rules configured in InsForge
 * to prevent unauthorized writes or deletions, as client-side checks
 * can be bypassed.
 */
