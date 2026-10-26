import type { StoreSettings } from '@/types/store';
export interface VariantRow { id: string; product_id: string; label: string; price: number; stock: number; active: boolean; }
export interface ProductRow { id: string; name: string; slug: string; description: string; category: string; price: number; images: string[]; tags: string[]; keywords: string[]; sku: string; published: boolean; created_at: string; store_variants: VariantRow[]; }
export interface PostRow { id: string; title: string; slug: string; summary: string; body: string; published: boolean; created_at: string; }
export interface OrderRow { id: string; reference: string; email: string; name: string; phone: string; state: string; city: string; address: string; notes: string; total: number; delivery: number; payment: 'Pending' | 'Paid' | 'Failed' | 'Refunded'; fulfillment: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'; tracking: string; created_at: string; store_order_items: { name: string; size: string; price: number; quantity: number }[]; }
export interface SubscriberRow { email: string; active: boolean; created_at: string; }
export interface MediaAsset { id: string; url: string; name: string; path: string; created_at: string; }
export interface AuditEntry { id: string; action: string; target: string; created_at: string; }
export interface AdminSnapshot { store_products: ProductRow[]; store_posts: PostRow[]; store_orders: OrderRow[]; store_subscribers: SubscriberRow[]; store_settings: { published: Partial<StoreSettings>; draft: Partial<StoreSettings> }[]; store_media: MediaAsset[]; store_audit: AuditEntry[]; }
export interface AdminSession { token: string; expiresAt: string; }
export interface SearchFilters { q: string; category: string; tag: string; min: number; max: number; available: boolean; sort: string; page: number; }
