# Cloudflare Setup

## DNS Records

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| A | athoo.pk | YOUR_VPS_IP | ✅ Proxied |
| A | www | YOUR_VPS_IP | ✅ Proxied |
| A | api | YOUR_VPS_IP | ✅ Proxied |
| A | admin | YOUR_VPS_IP | ✅ Proxied |
| A | media | YOUR_R2_BUCKET.r2.dev | ✅ Proxied |
| CNAME | turn | YOUR_VPS_IP | ❌ DNS only |

## SSL/TLS

Set to **Full (strict)** mode. Nginx handles plain HTTP on the VPS; 
Cloudflare adds HTTPS on top.

## Page Rules / Cache Rules

- `athoo.pk/api/*` → Cache Level: Bypass
- `athoo.pk/admin*` → Cache Level: Bypass
- `athoo.pk/*.js, *.css, *.png` → Cache Level: Cache Everything, TTL: 1 year

## Cloudflare Access (for Admin)

Enable Cloudflare Zero Trust > Access > Applications for `admin.athoo.pk`
to require login before reaching the admin panel.
