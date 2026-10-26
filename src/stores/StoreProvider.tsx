import { createContext, useContext, useState, useEffect, useCallback, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DEFAULT_SETTINGS } from '@/constants/store';
import { getPublicStore, getAdminStore, mapProduct, mapPost, mapOrder, itemStock } from '@/lib/cloudData';
import { useAdminAuth } from '@/stores/AdminAuthProvider';
import type { StoreData, CartItem } from '@/types/store';
import type { MediaAsset, AuditEntry } from '@/types/cloud';
import { z } from 'zod';
import { toast } from 'sonner';
interface StoreContext { data: StoreData; setData: Dispatch<SetStateAction<StoreData>>; loading: boolean; error: Error | null; refresh: () => void; media: MediaAsset[]; audit: AuditEntry[]; toggleLike: (id: string) => void; addToCart: (id: string, size: string, quantity?: number) => void; }
const Context = createContext<StoreContext | null>(null);
const schema = z.object({ cart: z.array(z.object({ productId: z.string().uuid(), size: z.string(), quantity: z.number().int().min(1).max(99) })), wishlist: z.array(z.string().uuid()) });
interface GuestData { cart: CartItem[]; wishlist: string[]; }
function guestData(): GuestData {
  const saved = localStorage.getItem('tomioka-guest-v2');
  if (!saved) return { cart: [], wishlist: [] };
  try { const parsed = schema.safeParse(JSON.parse(saved)); return parsed.success ? parsed.data : { cart: [], wishlist: [] }; } catch { return { cart: [], wishlist: [] }; }
}
export function StoreProvider({ children }: { children: ReactNode }) {
  const { session } = useAdminAuth(); const client = useQueryClient(); const [guest, setGuest] = useState<GuestData>(guestData);
  const publicStore = useQuery({ queryKey: ['store', 'public'], queryFn: getPublicStore, staleTime: 15000, refetchInterval: 30000 });
  const adminStore = useQuery({ queryKey: ['store', 'admin', session?.expiresAt], queryFn: () => getAdminStore(session!.token), enabled: !!session, staleTime: 15000, refetchInterval: session ? 30000 : false, retry: false });
  const snapshot = session ? adminStore.data : undefined; const published = publicStore.data;
  const settings = { ...DEFAULT_SETTINGS, ...published?.settings, ...snapshot?.store_settings[0]?.published };
  const data: StoreData = { ...guest, products: snapshot ? snapshot.store_products.map(mapProduct) : published?.products || [], posts: snapshot ? snapshot.store_posts.map(mapPost) : published?.posts || [], settings, draft: { ...settings, ...snapshot?.store_settings[0]?.draft }, orders: snapshot?.store_orders.map(mapOrder) || [], subscribers: snapshot?.store_subscribers.map(s => ({ email: s.email, active: s.active, createdAt: s.created_at })) || [] };
  useEffect(() => { localStorage.setItem('tomioka-guest-v2', JSON.stringify(guest)); }, [guest]);
  useEffect(() => { if (!session) client.removeQueries({ queryKey: ['store', 'admin'] }); }, [session, client]);
  const setData: Dispatch<SetStateAction<StoreData>> = next => { const value = typeof next === 'function' ? next(data) : next; setGuest({ cart: value.cart, wishlist: value.wishlist }); };
  const toggleLike = useCallback((id: string) => setGuest(s => ({ ...s, wishlist: s.wishlist.includes(id) ? s.wishlist.filter(x => x !== id) : [...s.wishlist, id] })), []);
  const addToCart = (id: string, size: string, quantity = 1) => {
    const p = data.products.find(p => p.id === id && p.published); const existing = guest.cart.find(c => c.productId === id && c.size === size);
    if (!p || !Number.isInteger(quantity) || quantity < 1 || (existing?.quantity || 0) + quantity > Math.min(itemStock(p, size), 99)) return toast.error('This option is unavailable or exceeds available stock.');
    setGuest(s => ({ ...s, cart: existing ? s.cart.map(c => c.productId === id && c.size === size ? { ...c, quantity: c.quantity + quantity } : c) : [...s.cart, { productId: id, size, quantity }] })); toast.success('Added to your bag.');
  };
  return <Context.Provider value={{ data, setData, toggleLike, addToCart, loading: session ? adminStore.isPending : publicStore.isPending, error: (session ? adminStore.error : publicStore.error), refresh: () => { void client.invalidateQueries({ queryKey: ['store'] }); }, media: snapshot?.store_media || [], audit: snapshot?.store_audit || [] }}>{children}</Context.Provider>;
}
export function useStore() { const store = useContext(Context); if (!store) throw new Error('Store provider is missing.'); return store; }
