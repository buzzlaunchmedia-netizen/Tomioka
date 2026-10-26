import { corsHeaders, json } from '../_shared/cors.ts';
import { db, checked, fingerprint } from '../_shared/database.ts';
import { adminAction } from '../_shared/adminActions.ts';
import { uploadMedia } from '../_shared/upload.ts';
import { z } from '../_shared/schemas.ts';
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  try {
    const multipart = req.headers.get('content-type')?.includes('multipart/form-data');
    const input = multipart ? null : z.object({ action: z.string(), payload: z.unknown().optional() }).parse(await req.json());
    if (input?.action === 'login') {
      const { pin } = z.object({ pin: z.string().regex(/^\d{6,12}$/) }).parse(input.payload);
      const result = checked(await db.rpc('store_pin_login', { p_pin: pin, p_ip: await fingerprint(req) }));
      return json(result, result.error ? 401 : 200);
    }
    const token = req.headers.get('x-admin-token') || '';
    if (token.length !== 72 || !checked(await db.rpc('store_admin_check', { p_token: token }))) return json({ error: 'Admin session expired. Sign in again.' }, 401);
    if (multipart) return json(await uploadMedia(req));
    if (input!.action === 'logout') { checked(await db.rpc('store_admin_logout', { p_token: token })); return json({ ok: true }); }
    console.log('Authorized store admin action:', input!.action);
    return json(await adminAction(input!.action, input!.payload));
  } catch (error) {
    console.error('Store admin request failed:', error instanceof z.ZodError ? 'Invalid input' : error instanceof Error ? error.message : 'Unknown failure');
    return json({ error: error instanceof z.ZodError ? 'Check the fields and try again.' : error instanceof Error ? error.message : 'Unable to complete this request.' }, 400);
  }
});
