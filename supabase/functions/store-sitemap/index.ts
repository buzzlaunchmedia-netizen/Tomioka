import { db, checked } from '../_shared/database.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
const ORIGIN = 'https://tomiokastore.vercel.app';
const xml = (value: string) => value.replace(/[<>&'\"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]!));
async function pages(table: string, columns: string) {
  const rows: { slug: string; updated_at?: string; created_at?: string }[] = [];
  for (let offset = 0; ; offset += 1000) {
    const batch = checked(await db.from(table).select(columns).eq('published', true).order('id').range(offset, offset + 999));
    rows.push(...batch as unknown as typeof rows);
    if (batch.length < 1000) return rows;
  }
}
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const [products, posts] = await Promise.all([pages('store_products', 'slug,updated_at'), pages('store_posts', 'slug,created_at')]);
    const paths = ['/', '/shop', '/about', '/blog', '/contact', '/policies/shipping', '/policies/returns', '/policies/privacy', '/policies/terms', '/policies/faq'];
    const urls = paths.map(path => `<url><loc>${ORIGIN}${path}</loc></url>`);
    for (const [prefix, rows] of [['product', products], ['blog', posts]] as const) for (const row of rows) urls.push(`<url><loc>${ORIGIN}/${prefix}/${xml(encodeURIComponent(row.slug))}</loc><lastmod>${xml(row.updated_at || row.created_at || '')}</lastmod></url>`);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`, { headers: { ...corsHeaders, 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' } });
  } catch (error) { console.error('Sitemap generation failed:', error instanceof Error ? error.message : 'Unknown error'); return json({ error: 'Sitemap is temporarily unavailable.' }, 503); }
});
