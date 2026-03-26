import { createClient } from '@insforge/sdk';

const isBrowser = typeof window !== 'undefined';
const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL || "https://ane7v4ce.us-east.insforge.app";
const supabaseUrl = isBrowser ? '/api/insforge' : (process.env.INSFORGE_URL || INSFORGE_URL);
const supabaseAnonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || '';

export const insforge = createClient({
  baseUrl: supabaseUrl,
  anonKey: supabaseAnonKey,
});
