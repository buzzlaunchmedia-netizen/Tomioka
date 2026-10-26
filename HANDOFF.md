# Tomioka's Store — OnSpace Cloud catalogue and Vercel setup

## Implemented in this stage
- Real cloud catalogue, with no seeded concept products, fake orders, reviews or sales data.
- Parameterized public database search across product names, descriptions, categories, tags, search aliases and SKUs. Debounced queries, NGN price/availability filters, sorting, pagination, loading and retry states. Polling is used instead of Realtime.
- Protected product create/edit/duplicate and publish/unpublish; multiple product images; reusable media library; per-option prices and stock. Product/variant saves run in one database transaction. Removed options become inactive rather than breaking historical order associations.
- Device uploads to permanent public `store-media` storage. PNG/JPEG/WebP only, size limit 5 MB, server MIME/magic-byte validation, unique paths. Only the authorized edge service writes. Removing an image from a product does not delete the stored file.
- Shared administrator PIN verified only on the server; salted SHA-256 credential, 5 attempts per IP per 15-minute window plus a global attempt cap, opaque expiring sessions, 6-hour expiry, logout/revocation and PIN change. PIN changes revoke all sessions. No initial PIN exists in frontend source. Change the chat-shared initial PIN in `/admin?tab=security` before launch. PIN access is a single shared administrator identity, not individual staff accounts or MFA.
- Cloud-persistent website/logo/contact/delivery settings with private drafts and publish, blog drafts/publication, newsletter consent/unsubscribe and private subscriber exports, order requests and audit history. Browser code never writes business tables directly.
- Guest order requests validate variant prices, option stock and published delivery fees on the server. Idempotency keys prevent duplicate requests on retries. Totals do not come from browser-submitted prices. These are **unpaid requests**, not completed purchases. No stock reservation/decrement happens until a future verified-payment allocation flow is implemented. Unpaid orders cannot be processed or shipped.
- Secure public tracking checks a high-entropy reference plus checkout email. Responses omit names, addresses, emails and phone numbers. Lookup requests are rate limited.
- Exact canonical origin: `https://tomiokastore.vercel.app`. Route canonical/OG/Twitter metadata and noindex for private utility routes. Genuine Product structured data uses published names, descriptions, images and SKUs; no invented ratings or offer/payment promises.
- `vercel.json` SPA routing, text/XML response headers, security headers, and an external `/sitemap.xml` rewrite to the public cloud sitemap function. It dynamically includes only published product/article URLs. `robots.txt` is emitted by Vite and advertises that exact domain.

## Backend models and functions
Tables: `store_products`, `store_variants`, `store_settings`, `store_posts`, `store_subscribers`, `store_orders`, `store_order_items`, `store_media`, `store_admin_credentials`, `store_admin_sessions`, `store_rate_limits`, `store_audit`.
All tables have RLS. Browser roles can read published products, active variants on published products, and published posts. Private tables have no browser policies. Browser roles cannot execute privileged PIN/product/order routines. `service_role` can execute them; its key is only used in edge functions.
Edge functions: `store-admin` (PIN login and session-protected management/uploads), `store-public` (published settings, unpaid order creation, protected lookup, consent and unsubscribe), `store-sitemap` (public XML). CORS is shared. JWT checks are disabled in `supabase/config.toml` because these endpoints implement anonymous public access or their own opaque PIN-session authorization. Admin mutations still require a valid server-side session.
SQL routines: `store_pin_login`, `store_admin_check`, `store_admin_logout`, `store_change_pin`, `store_rate_check`, `store_save_product`, `store_create_order`, `store_search_products`. Protected routines explicitly revoke execution from public/anon/authenticated and grant service_role only. Search is security-invoker and respects RLS.

## Data migration and storage
The earlier hardcoded concept catalogue is removed from the application and was not inserted into the database. Legacy local preview business data is no longer loaded, but its old storage key is left intact as a manual backup; no unreviewed local entries are automatically imported. Add confirmed, commercially authorized merchandise through the secure administration screen.
Only guest bag selections and guest favourites remain local on the device, as appropriate for visitors without accounts. These are not authoritative pricing/order records. Admin session tokens are in sessionStorage and never in URLs. No business data or PIN is persisted in browser localStorage.
Initial brand copy and logo are safe configuration defaults, not merchandise records. Publish settings to persist the complete desired website configuration. The hero/category illustrations remain labelled editorial concept artwork and are not inventory claims.

## Vercel deployment
1. Deploy this source to the existing Vercel project `tomiokastore`; framework Vite, build `npx vite build`, output `dist`. Root `vercel.json` contains these settings.
2. In Vercel Environment Variables, copy the project's existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values. Do not change the automatically generated OnSpace values and never add `SUPABASE_SERVICE_ROLE_KEY`, payment secrets or an admin PIN to any VITE variable.
3. Keep the backend with OnSpace Cloud. Edge functions and the SQL schema are hosted there; do not deploy them as Node servers on Vercel.
4. Confirm that OnSpace deploys the three edge functions with the function settings in `supabase/config.toml`. The sitemap endpoint must allow anonymous access. All admin actions must still enforce their server token checks.
5. Redeploy Vercel, then test direct `/shop`, `/product/<real-slug>`, `/blog/<real-slug>`, `/admin`, `/robots.txt` and `/sitemap.xml` URLs.
6. Log in at `/admin`, change the initial PIN, upload real images, publish a product with options, publish a positive delivery fee and real support details. Zero/unconfigured delivery blocks order requests in this stage.

## Google Search Console
Add a **URL-prefix** property for `https://tomiokastore.vercel.app/`, not ownership of the entire shared `vercel.app` domain. Choose HTML-tag verification. Copy the actual content token into a Vercel environment variable called `GOOGLE_SITE_VERIFICATION`, enabled for production builds. Redeploy: the Vite HTML transform inserts the meta tag into the served HTML. No token is guessed or fabricated. Verify in Search Console, then submit `sitemap.xml`.
The live Vercel sitemap is generated from the cloud database and cached for five minutes, so catalogue publishing does not require rebuilding it. The bundled XML asset has static page URLs as a portable fallback; other hosts require an equivalent rewrite for dynamic catalogue updates. Google controls indexing. React route metadata is client-rendered; many social crawlers do not execute JavaScript. Per-route prerendering is a later improvement, not a claim made here.

## External integrations and remaining work
Paystack is **not connected**. Existing requests remain Pending/unpaid, and payment cannot be manually marked Paid through the admin UI. A secret must be configured securely before implementing initialization, server verification, signed/idempotent webhooks and transactionally allocated inventory. Adding a public key alone does not enable secure payments.
No email delivery provider or campaign sender is connected. Newsletter consent is saved, no confirmation/campaign emails are claimed sent. New signups receive a self-service unsubscribe token link immediately; a future email provider must send and retain proper unsubscribe links. Subscriber management and exports exclude inactive contacts. Confirmation/double opt-in and stronger signup anti-abuse protections remain launch work.
Other outstanding features: customer email/password accounts, authenticated wishlist sync, review eligibility/moderation, discount codes, supplier/made-to-order workflows, courier APIs, regional/pickup shipping, refund integration, editable full policy pages, scheduled/rich blog content, staff roles/MFA, retention/backup procedures and production-grade monitoring. Existing policy pages explicitly note that final legal terms require owner confirmation.
PIN access has limited entropy compared with individual strong-password accounts/MFA. Rotate the chat-shared PIN, use a longer private PIN, and consider individual staff authentication before a large-scale launch. Session tokens in browser storage require diligent XSS prevention; no HTML is rendered from untrusted article text.

## Verification performed and not performed
Database schema creation succeeded. Inspection confirms catalogue/orders initially empty, admin credential configured, RLS enabled, no public private-data policies, and browser execution revoked on protected PIN/product/order functions. Parameterized public search is granted to browser roles.
No terminal/build runner or interactive browser-testing tool was available during this edit. Vercel deployment, the edge-function deployment configuration, end-to-end login/upload/create/publish/search/order/lookup, Google verification and real payment processing have **not** been confirmed by automated browser tests. Check the following before launch:
- Anonymous direct product writes and private order/subscriber/credential reads fail.
- Invalid/expired/revoked admin sessions cannot call management or upload APIs.
- Wrong PIN throttling works; a changed PIN revokes all sessions.
- Valid raster images upload permanently; SVG and oversized/mismatched files fail.
- Drafts cannot appear in public search, pages or sitemap; published changes appear after polling/cache refresh.
- Cart option prices are correct; invalid stock/quantities fail server validation; retries create one unpaid request.
- Mismatched tracking reference/email never reveals customer information.
- Requests never show paid or shipped without legitimate verification.
- Sitemap XML uses only `tomiokastore.vercel.app` and real published slugs, and Google verification appears in raw deployed HTML only when the real token is provided.
