import type { Post } from '@/types/store';
import { SITE_ORIGIN, BRAND_LOGO } from '@/constants/store';
interface Props { post: Post; }
export default function ArticleStructuredData({ post }: Props) {
  const data = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.summary, datePublished: post.createdAt, mainEntityOfPage: `${SITE_ORIGIN}/blog/${post.slug}`, publisher: { '@type': 'Organization', name: "Tomioka's Store", url: SITE_ORIGIN, logo: { '@type': 'ImageObject', url: BRAND_LOGO } } };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}/>;
}
