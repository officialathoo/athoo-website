# Athoo Architecture Overview

## System Components

```
                    ┌─────────────────────┐
                    │   Cloudflare DNS/SSL │
                    │  (athoo.pk, api.,    │
                    │   admin., turn.)     │
                    └────────┬────────────┘
                             │ HTTPS
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
         athoo.pk      api.athoo.pk   admin.athoo.pk
         (Website)       (API)         (Admin Panel)
              │              │              │
              └──────────────▼──────────────┘
                        ┌─────────┐
                        │  Nginx  │  (VPS)
                        └────┬────┘
                             │
                    ┌────────▼────────┐
                    │   services/api  │
                    │   (Express 5)   │
                    └────┬────┬───────┘
                         │    │
              ┌──────────┘    └──────────┐
              ▼                          ▼
        PostgreSQL                    Redis
        (Data store)              (Cache/Sessions)
```

## Provider Adapter Pattern

All external services (maps, email, storage, OTP) are accessed through
adapter interfaces defined in `packages/config`. This means you can swap
providers without changing application code:

- **Storage**: Cloudflare R2 → S3 compatible (just change STORAGE_PROVIDER)
- **Email**: Resend → Zoho SMTP (just change EMAIL_PROVIDER)
- **Maps**: MapLibre + OSM (no API key required for basic usage)
- **Routing**: GraphHopper (API key backend-only, never in client)

## Security Model

1. All secrets live in server environment variables only
2. GraphHopper API key is NEVER sent to the client
3. R2 credentials are NEVER sent to the client
4. Admin panel protected by HMAC-signed tokens (12hr expiry)
5. Cloudflare proxies all traffic (hides VPS IP)
