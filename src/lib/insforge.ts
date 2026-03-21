import { createClient } from '@insforge/sdk';

const isBrowser = typeof window !== 'undefined';
const INSFORGE_URL = process.env.INSFORGE_URL || (process.env.NODE_ENV === 'production' ? '' : "https://ane7v4ce.us-east.insforge.app");
const supabaseUrl = isBrowser ? '/api/insforge' : INSFORGE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || (process.env.NODE_ENV === 'production' ? '' : '');

if (process.env.NODE_ENV === 'production' && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error("Missing InsForge configuration in production (INSFORGE_URL or NEXT_PUBLIC_INSFORGE_ANON_KEY).");
}

export const insforge = createClient({
  baseUrl: supabaseUrl,
  anonKey: supabaseAnonKey,
});
