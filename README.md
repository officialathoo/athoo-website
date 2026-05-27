# Athoo Website Professional Admin Edition

This version keeps the existing Athoo frontend style and adds a professional lead-management backend.

## Added
- Secure lead saving to Neon PostgreSQL
- Professional admin dashboard with Athoo logo/sidebar
- Lead CRM with search, filters, status, priority, assignment and notes
- Filtered CSV export
- Bulk/optional email system using Resend
- Admin email notification support on form submissions
- Super Admin / Admin / Manager / Custom user structure
- Admin creation and role management
- Maintenance-mode settings storage
- Activity logs
- Improved FAQ and complete Athoo overview content
- Mobile-friendly responsive fixes and lightweight 3D hover effects

## Local setup
```powershell
pnpm install
copy .env.example .env.local
vercel dev
```

## Vercel settings
Install command: `pnpm install --frozen-lockfile=false`
Build command: `pnpm run build`
Output directory: `dist`

Add env variables in Vercel Production/Preview/Development:
- DATABASE_URL
- ADMIN_PASSWORD
- AUTH_SECRET
- SUPER_ADMIN_EMAIL
- LEAD_NOTIFY_TO
- LEAD_EMAIL_FROM
- RESEND_API_KEY
- RATE_LIMIT_PER_MINUTE

## Neon
Run `database/schema.sql` in Neon SQL editor once. The API also auto-creates/updates the schema on first request.

## Admin login
Use the ADMIN_PASSWORD for simple super-admin login. After login, you can add named admin users with email/password roles.
