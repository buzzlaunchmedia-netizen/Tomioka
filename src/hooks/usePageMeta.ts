import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_ORIGIN, BRAND_LOGO } from '@/constants/store';
function meta(attribute: 'name' | 'property', key: string, value: string) {
  let element = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) { element = document.createElement('meta'); element.setAttribute(attribute,key); document.head.appendChild(element); }
  element.content = value;
}
export function usePageMeta(title: string, description: string) {
  const { pathname } = useLocation();
  useEffect(() => {
    const url = SITE_ORIGIN + pathname; document.title = `${title} | Tomioka's Store`;
    meta('name','description',description); meta('property','og:title',document.title); meta('property','og:description',description); meta('property','og:url',url);
    meta('name','twitter:title',document.title); meta('name','twitter:description',description);
    meta('property','og:image',BRAND_LOGO); meta('name','twitter:image',BRAND_LOGO); meta('property','og:type',pathname.startsWith('/blog/')?'article':'website');
    meta('name','robots',/^\/(admin|checkout|cart|track|wishlist|unsubscribe)(\/|$)/.test(pathname)?'noindex,nofollow':'index,follow');
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = url;
  }, [title,description,pathname]);
}
