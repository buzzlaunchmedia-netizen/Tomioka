import { supabase, publicAction, adminAction } from '@/lib/api';
import type { ProductRow, PostRow, OrderRow, AdminSnapshot } from '@/types/cloud';
import type { Product, Post, Order, StoreSettings } from '@/types/store';
export function mapProduct(p: ProductRow): Product {
  const variants = p.store_variants.filter(v => v.active).map(v => ({ id: v.id, label: v.label, price: Number(v.price), stock: v.stock }));
  return { id: p.id, name: p.name, slug: p.slug, description: p.description, category: p.category, tags: p.tags, keywords: p.keywords, sku: p.sku, images: p.images, image: p.images[0] || '', price: variants.length ? Math.min(...variants.map(v => v.price)) : Number(p.price), stock: variants.reduce((n, v) => n + v.stock, 0), sizes: variants.map(v => v.label), variants, published: p.published, preview: false, createdAt: p.created_at };
}
export const mapPost = (p: PostRow): Post => ({ id: p.id, title: p.title, slug: p.slug, summary: p.summary, body: p.body, published: p.published, createdAt: p.created_at });
export const mapOrder = (o: OrderRow): Order => ({ ...o, reference: o.reference, createdAt: o.created_at, total: Number(o.total), delivery: Number(o.delivery), items: o.store_order_items.map(i => ({ ...i, price: Number(i.price) })) });
async function readRows<T>(table: string, columns: string): Promise<T[]> {
  const rows: T[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase.from(table).select(columns).order('id').range(offset, offset + 499);
    if (error) throw new Error('Unable to load the store catalogue. Please retry.');
    rows.push(...data as unknown as T[]);
    if (data.length < 500) return rows;
  }
}
export async function getPublicStore() {
  const [products, posts, settings] = await Promise.all([readRows<ProductRow>('store_products', '*,store_variants(*)'), readRows<PostRow>('store_posts', '*'), publicAction<Partial<StoreSettings>>('settings')]);
  return { products: products.map(mapProduct), posts: posts.map(mapPost), settings };
}
export const getAdminStore = (token: string) => adminAction<AdminSnapshot>(token, 'snapshot');
export function productPayload(p: Product) {
  return { id: p.id, name: p.name, slug: p.slug, description: p.description, category: p.category, images: p.images, tags: p.tags, keywords: p.keywords, sku: p.sku, price: p.price, published: p.published, variants: p.variants.map(v => ({ label: v.label, price: v.price, stock: v.stock })) };
}
export const itemPrice = (p: Product | undefined, size: string) => p?.variants.find(v => v.label === size)?.price || 0;
export const itemStock = (p: Product | undefined, size: string) => p?.variants.find(v => v.label === size)?.stock || 0;
