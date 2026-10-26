import { createClient } from 'npm:@supabase/supabase-js@2';
export const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
export function checked<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) { console.error('Store database:', result.error.message); throw new Error('Unable to save or load store data. Please retry.'); }
  return result.data;
}
export async function fingerprint(req: Request) {
  const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip + Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')));
  return Array.from(new Uint8Array(bytes), x => x.toString(16).padStart(2, '0')).join('');
}
export async function hash(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), x => x.toString(16).padStart(2, '0')).join('');
}
