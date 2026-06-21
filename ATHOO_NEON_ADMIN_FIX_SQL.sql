-- Run this in Neon SQL Editor if old admin permissions/settings are already stored.

UPDATE athoo_admin_users
SET permissions = '{"all":true}'::jsonb,
    role = 'super_admin',
    is_active = true,
    updated_at = NOW()
WHERE lower(email) = 'official@athoo.pk';

INSERT INTO app_settings (key, value, updated_at)
VALUES
  ('maintenance_mode', '{"enabled":false,"message":"Athoo website is under maintenance. Please check back soon."}'::jsonb, NOW()),
  ('support_email', '"official@athoo.pk"'::jsonb, NOW()),
  ('support_phone', '"+92 339 0051068"'::jsonb, NOW())
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();
