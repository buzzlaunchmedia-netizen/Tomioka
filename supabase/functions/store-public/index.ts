import { corsHeaders, json } from '../_shared/cors.ts';
import { db, checked, fingerprint, hash } from '../_shared/database.ts';
import { orderSchema, z } from '../_shared/schemas.ts';
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
    const input = z.object({ action: z.string(), payload: z.unknown().optional() }).parse(await req.json());
    if (input.action === 'settings') return json(checked(await db.from('store_settings').select('published').eq('id', true).single()).published);
    const ip = await fingerprint(req);
    if (!checked(await db.rpc('store_rate_check', { p_key: `${input.action}:${ip}`, p_limit: input.action === 'track' ? 10 : 20 }))) return json({ error: 'Too many requests. Please try again in 15 minutes.' }, 429);
    if (input.action === 'order') {
      const p = z.object({ customer: orderSchema, key: z.string().uuid(), items: z.array(z.object({ productId: z.string().uuid(), size: z.string().min(1).max(100), quantity: z.number().int().min(1).max(99) })).min(1).max(50) }).parse(input.payload);
      const { data, error } = await db.rpc('store_create_order', { p: p.customer, p_items: p.items, p_key: p.key });
      if (error) { console.error('Order validation:', error.message); return json({ error: error.message.startsWith('An ') || error.message.startsWith('A product') || error.message.startsWith('Delivery fees') ? error.message : 'Unable to create this order. Review your bag and retry.' }, 400); }
      return json(data);
    }
    if (input.action === 'track') {
      const p = z.object({ reference: z.string().trim().max(50), email: z.string().trim().email().max(254) }).parse(input.payload);
      const order = checked(await db.from('store_orders').select('id,reference,created_at,payment,fulfillment,total,delivery,tracking,store_order_items(name,size,price,quantity)').eq('reference', p.reference.toUpperCase()).eq('email', p.email.toLowerCase()).maybeSingle());
      if (!order) return json({ error: 'No order matches that reference and email.' }, 404);
      return json(order);
    }
    if (input.action === 'subscribe') {
      const p = z.object({ email: z.string().trim().email().max(254), consent: z.literal(true) }).parse(input.payload);
      const token = crypto.randomUUID() + crypto.randomUUID();
      const email = p.email.toLowerCase();
      const existing = checked(await db.from('store_subscribers').select('active').eq('email', email).maybeSingle());
      if (existing?.active) return json({ ok: true });
      checked(await db.from('store_subscribers').upsert({ email, active: true, unsubscribe_hash: await hash(token) }));
      return json({ ok: true, unsubscribeToken: token });
    }
    if (input.action === 'unsubscribe') {
      const p = z.object({ token: z.string().length(72) }).parse(input.payload);
      checked(await db.from('store_subscribers').update({ active: false }).eq('unsubscribe_hash', await hash(p.token)));
      return json({ ok: true });
    }
    return json({ error: 'Unknown action.' }, 400);
  } catch (error) {
    console.error('Store public request:', error instanceof Error ? error.message : 'Invalid request');
    return json({ error: error instanceof z.ZodError ? 'Check your information and try again.' : 'Unable to complete the request. Please retry.' }, 400);
  }
});
