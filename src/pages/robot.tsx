import { Link } from 'react-router-dom';
import { SITE_ORIGIN } from '@/constants/store';
import { usePageMeta } from '@/hooks/usePageMeta';
export default function Robot() {
  usePageMeta('Search discoverability','Canonical URLs, robots.txt and database-backed sitemap status for Tomioka’s Store.');
  return <main className="container-shell py-16"><p className="eyebrow">Search discoverability</p><h1 className="mt-4 text-4xl font-semibold">Ready to be discovered.</h1><div className="panel mt-8 max-w-3xl"><p className="leading-7 text-muted">The canonical domain is <strong className="text-foreground">{SITE_ORIGIN}</strong>. Vercel serves robots.txt and routes sitemap.xml to OnSpace Cloud, where published products and articles are included automatically. Private pages and drafts are excluded.</p><p className="mt-5 leading-7 text-muted">Add this URL-prefix property to Google Search Console. Put Google's actual HTML-tag token in the GOOGLE_SITE_VERIFICATION Vercel environment variable and redeploy, then verify ownership and submit sitemap.xml. No Google token is fabricated; indexing is not guaranteed.</p><div className="mt-6 flex flex-wrap gap-4"><a href="/robots.txt" className="btn-secondary">View robots.txt</a><a href="/sitemap.xml" className="btn-secondary">View live sitemap</a><Link to="/admin?tab=seo" className="btn-primary">SEO setup guide</Link></div></div></main>;
}
