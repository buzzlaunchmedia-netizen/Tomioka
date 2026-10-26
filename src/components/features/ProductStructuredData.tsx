import type { Product } from '@/types/store';
import { SITE_ORIGIN } from '@/constants/store';
interface Props { product: Product; }
export default function ProductStructuredData({ product: p }: Props) {
  const data = { '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.description, image: p.images, ...(p.sku ? { sku: p.sku } : {}), url: `${SITE_ORIGIN}/product/${p.slug}`, category: p.category };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}/>;
}
