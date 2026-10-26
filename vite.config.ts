import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath, URL } from 'node:url';
const origin = 'https://tomiokastore.vercel.app';
const sitemapEndpoint = 'https://gmsmmjsyvbqmepmygmsm.backend.onspace.ai/functions/v1/store-sitemap';
const robots = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /checkout\nDisallow: /cart\nDisallow: /track\nDisallow: /wishlist\nDisallow: /unsubscribe\nSitemap: ${origin}/sitemap.xml\n`;
const paths = ['/', '/shop', '/about', '/blog', '/contact', '/policies/shipping', '/policies/returns', '/policies/privacy', '/policies/terms', '/policies/faq'];
const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${origin}${path}</loc></url>`).join('')}</urlset>`;
function discovery(verification: string): Plugin {
  return {
    name: 'store-discovery',
    transformIndexHtml() { return verification && /^[a-zA-Z0-9_-]{1,200}$/.test(verification) ? [{ tag: 'meta', attrs: { name: 'google-site-verification', content: verification }, injectTo: 'head' }] : []; },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split('?')[0];
        if (path === '/robots.txt') { res.setHeader('Content-Type','text/plain; charset=utf-8'); res.end(robots); return; }
        if (path !== '/sitemap.xml') return next();
        void fetch(sitemapEndpoint).then(async response => {
          if (!response.ok) throw new Error(`Cloud sitemap returned ${response.status}`);
          res.setHeader('Content-Type','application/xml; charset=utf-8'); res.end(await response.text());
        }).catch(error => { console.error('Cloud sitemap:', error); res.statusCode = 503; res.setHeader('Content-Type','text/plain'); res.end('Cloud sitemap temporarily unavailable.'); });
      });
    },
    generateBundle() { this.emitFile({type:'asset',fileName:'robots.txt',source:robots}); if (!process.env.VERCEL) this.emitFile({type:'asset',fileName:'sitemap.xml',source:fallbackSitemap}); },
  };
}
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return { plugins:[react(),discovery(process.env.GOOGLE_SITE_VERIFICATION || env.GOOGLE_SITE_VERIFICATION || '')],resolve:{alias:{'@':fileURLToPath(new URL('./src',import.meta.url))}},server:{host:'0.0.0.0',port:5173} };
});
