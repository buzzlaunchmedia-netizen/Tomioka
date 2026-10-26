import { db, checked } from './database.ts';
import { productSchema, settingsSchema, postSchema, z } from './schemas.ts';
export async function adminAction(action: string, payload: unknown) {
  if (action === 'snapshot') {
    const tables = ['store_products', 'store_posts', 'store_orders', 'store_subscribers', 'store_settings', 'store_media', 'store_audit'];
    const results = await Promise.all(tables.map(async t => {
      const columns = t === 'store_products' ? '*,store_variants(*)' : t === 'store_orders' ? '*,store_order_items(*)' : t === 'store_subscribers' ? 'email,active,created_at' : '*';
      const rows: unknown[] = [];
      for (let offset = 0; ; offset += 500) {
        const batch = checked(await db.from(t).select(columns).order(t === 'store_settings' ? 'id' : 'created_at', { ascending: false }).order(t === 'store_subscribers' ? 'email' : 'id').range(offset,offset + 499));
        rows.push(...batch); if (batch.length < 500) return rows;
      }
    }));
    return Object.fromEntries(tables.map((t, i) => [t, results[i]]));
  }
  if (action === 'save_product') return { id: checked(await db.rpc('store_save_product', { p: productSchema.parse(payload) })) };
  if (action === 'visibility') {
    const p = z.object({ id: z.string().uuid(), published: z.boolean() }).parse(payload);
    checked(await db.from('store_products').update({ published: p.published, updated_at: new Date().toISOString() }).eq('id', p.id));
  } else if (action === 'settings') {
    const p = z.object({ settings: settingsSchema, publish: z.boolean() }).parse(payload);
    checked(await db.from('store_settings').upsert({ id: true, draft: p.settings, ...(p.publish ? { published: p.settings } : {}), updated_at: new Date().toISOString() }));
  } else if (action === 'save_post') {
    const p = postSchema.parse(payload); const id = p.id || crypto.randomUUID();
    const previous = checked(await db.from('store_posts').select('slug').eq('id', id).maybeSingle());
    const slug = previous?.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + id.slice(0, 8);
    checked(await db.from('store_posts').upsert({ ...p, id, slug }));
  } else if (action === 'unsubscribe') {
    const p = z.object({ email: z.string().email() }).parse(payload);
    checked(await db.from('store_subscribers').update({ active: false }).eq('email', p.email));
  } else if (action === 'fulfillment') {
    const p = z.object({ id: z.string().uuid(), status: z.enum(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']), tracking: z.string().max(200).default('') }).parse(payload);
    const order = checked(await db.from('store_orders').select('payment,fulfillment').eq('id', p.id).single());
    if (p.status !== 'Pending' && p.status !== 'Cancelled' && order.payment !== 'Paid') throw new Error('Unpaid orders cannot be processed or dispatched.');
    const next: Record<string, string[]> = { Pending: ['Pending','Processing','Cancelled'], Processing: ['Processing','Shipped','Cancelled'], Shipped: ['Shipped','Delivered'], Delivered: ['Delivered'], Cancelled: ['Cancelled'] };
    if (!next[order.fulfillment].includes(p.status)) throw new Error('This status transition is not allowed.');
    checked(await db.from('store_orders').update({ fulfillment: p.status, tracking: p.tracking }).eq('id', p.id).eq('fulfillment', order.fulfillment));
  } else if (action === 'change_pin') {
    const p = z.object({ pin: z.string().regex(/^\d{6,12}$/) }).parse(payload);
    checked(await db.rpc('store_change_pin', { p_pin: p.pin }));
  } else throw new Error('Unknown admin action.');
  checked(await db.from('store_audit').insert({ action, target: typeof payload === 'object' && payload && 'id' in payload ? String(payload.id) : '' }));
  return { ok: true };
}
