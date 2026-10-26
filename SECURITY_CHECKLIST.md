# Security checks before accepting live payments

The catalogue and private business records use OnSpace Cloud. The shared PIN is checked in server-only SQL, never client JavaScript. Rotate the initially shared PIN before launch.

1. Test wrong PIN attempt throttling and six-hour session expiry. Check logout and PIN rotation prevent reuse of old tokens.
2. Anonymous PostgREST writes to `store_products`/`store_variants` must fail. Anonymous reads of orders, newsletter emails, drafts, audit records and administrator secrets must return no data.
3. Unauthorized calls to `store-admin` and raster uploads must fail. MIME/header mismatches and files larger than 5 MB must fail.
4. Test parameterized search with punctuation and SQL-like strings; never build a PostgREST filter expression directly from user input.
5. Verify duplicate order retries return one reference. Browser-supplied price fields are never used. Every order remains Pending until a future payment provider verifies it.
6. Test wrong reference/email pairs. Public tracking responses must omit address/email/phone/name.
7. Newsletter consent is mandatory and separate from checkout. Public endpoints never return the subscriber list. Confirm token-based unsubscribe and export suppression.
8. On Vercel, expose only the public VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Service role keys, credentials and payment secrets belong exclusively in OnSpace Cloud Secrets.
9. Review final legal policies, retention, licensed product artwork and private support channels before collecting production data.
10. Add individual strong-password/MFA staff authentication as the business scales; shared PIN access does not identify separate staff members.

Database RLS/execute privileges were inspected during implementation. Interactive browser flows and Vercel/edge deployment have not been end-to-end tested in this editing environment.
