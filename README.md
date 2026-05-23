# Athoo Website — Clean SEO Deployment Build

Official Athoo pre-launch website for Pakistan's upcoming smart home services app.

## Deploy on Vercel

Use these settings:

- Framework Preset: Vite
- Root Directory: leave empty / repo root
- Build Command: `pnpm run build`
- Output Directory: `dist/public`
- Install Command: `pnpm install --frozen-lockfile=false`

## Email form setup

For reliable form delivery, add these Vercel Environment Variables:

```env
RESEND_API_KEY=your_resend_api_key
EMAIL_TO=official.athoo@gmail.com
EMAIL_FROM=Athoo Website <onboarding@resend.dev>
```

Without Resend, the forms fall back to FormSubmit/mailto, but Resend is recommended for production reliability.

## Included SEO setup

- SEO-friendly titles and descriptions
- Open Graph metadata
- Twitter card metadata
- Organization schema
- WebSite schema
- MobileApplication schema
- sitemap.xml
- robots.txt
- site.webmanifest
- canonical URL
- clean Vercel headers
- optimized Vite build output

## Social links

- Instagram: https://www.instagram.com/athoo_services/
- Facebook: https://www.facebook.com/share/17YFFojFAc/?mibextid=wwXIfr
- TikTok: https://www.tiktok.com/@athoo.pk
- Email: official.athoo@gmail.com
- Phone/WhatsApp: +92 339 0051068
