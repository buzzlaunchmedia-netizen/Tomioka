import { createClient, FunctionsHttpError } from '@supabase/supabase-js';
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, { auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true } });
export async function invoke<T>(name: string, body: Record<string, unknown> | FormData, token?: string): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body, headers: token ? { 'x-admin-token': token } : {} });
  if (error) {
    let message = error.message;
    if (error instanceof FunctionsHttpError) {
      const text = await error.context.text();
      try { const response = JSON.parse(text) as { error?: string }; message = response.error || text; } catch { message = text || message; }
      if (error.context.status === 401 && token) window.dispatchEvent(new Event('store-admin-expired'));
    }
    throw new Error(message || 'Unable to reach OnSpace Cloud. Please retry.');
  }
  if (data?.error) throw new Error(String(data.error));
  return data as T;
}
export const publicAction = <T,>(action: string, payload?: unknown) => invoke<T>('store-public', { action, payload });
export const adminAction = <T,>(token: string, action: string, payload?: unknown) => invoke<T>('store-admin', { action, payload }, token);
