import { createClient } from '@insforge/sdk';

const supabaseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || '';

export const insforge = createClient({
  baseUrl: supabaseUrl,
  anonKey: supabaseAnonKey,
});
