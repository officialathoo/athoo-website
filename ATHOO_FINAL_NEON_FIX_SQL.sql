-- Athoo final admin/settings permissions repair
-- Run once in Neon SQL Editor after deploying this package.

UPDATE athoo_admin_users
SET
  role = 'super_admin',
  permissions = '{"all":true}'::jsonb,
  is_active = true,
  updated_at = NOW()
WHERE lower(email) = 'official@athoo.pk';

INSERT INTO app_settings (key, value, updated_at)
VALUES
  ('maintenance_mode', '{"enabled":false,"message":"Athoo website is under maintenance. Please check back soon."}'::jsonb, NOW()),
  ('support_email', '"official@athoo.pk"'::jsonb, NOW()),
  ('support_phone', '"+92 339 0051068"'::jsonb, NOW()),
  ('site_title', '"Athoo — Pakistan Smart Home Services"'::jsonb, NOW()),
  ('site_description', '"Athoo is Pakistan smart home services platform for Rawalpindi and Islamabad."'::jsonb, NOW())
ON CONFLICT (key) DO NOTHING;

INSERT INTO roles (name, label, description)
VALUES
  ('super_admin', 'Super Admin', 'Full system access'),
  ('admin', 'Admin', 'Admin access'),
  ('manager', 'Manager', 'Lead/content management'),
  ('custom', 'Custom', 'Custom permissions')
ON CONFLICT (name) DO NOTHING;
