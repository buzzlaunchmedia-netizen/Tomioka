import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/api';
import { mapProduct } from '@/lib/cloudData';
import type { ProductRow, SearchFilters } from '@/types/cloud';
export function useProductSearch(filters: SearchFilters) {
  return useQuery({ queryKey: ['catalogue-search', filters], queryFn: async () => {
    const order = filters.sort === 'low' || filters.sort === 'high' ? 'price' : 'created_at';
    const { data, count, error } = await supabase.rpc('store_search_products', { q: filters.q.trim().slice(0, 200), cat: filters.category === 'All merch' ? '' : filters.category, tag: filters.tag, min_price: filters.min, max_price: filters.max, available: filters.available }).select('*,store_variants(*)', { count: 'exact' }).order(order, { ascending: filters.sort === 'low' }).order('id').range(0, filters.page * 12 - 1);
    if (error) throw new Error('Product search could not load. Please retry.');
    return { products: (data as unknown as ProductRow[]).map(mapProduct), total: count || 0 };
  }, staleTime: 15000, refetchInterval: 30000 });
}
