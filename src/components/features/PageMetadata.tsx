import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_ORIGIN } from '@/constants/store';
export default function PageMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = SITE_ORIGIN + pathname;
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (robots) robots.content = /^\/(admin|cart|checkout|wishlist|track|unsubscribe)(\/|$)/.test(pathname) ? 'noindex,nofollow' : 'index,follow';
  }, [pathname]);
  return null;
}
