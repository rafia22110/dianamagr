import { createClient } from '@insforge/sdk';

const isBrowser = typeof window !== 'undefined';
const INSFORGE_URL = "https://ane7v4ce.us-east.insforge.app";
const supabaseUrl = isBrowser ? '/api/insforge' : INSFORGE_URL;
const supabaseAnonKey = 'ik_bf44df2031c6d8808e0d4cff27b52575';

export const insforge = createClient({
  baseUrl: supabaseUrl,
  anonKey: supabaseAnonKey,
});
