-- =============================================================================
-- Athoo Complete Database Schema
-- Safe to run multiple times (uses IF NOT EXISTS + ADD COLUMN IF NOT EXISTS)
-- Run this on any fresh PostgreSQL server to set up the full Athoo database.
-- =============================================================================

-- ─── WEBSITE LEADS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS website_leads (
  id             BIGSERIAL PRIMARY KEY,
  form_type      TEXT NOT NULL,
  name           TEXT,
  email          TEXT,
  phone          TEXT,
  subject        TEXT,
  message        TEXT,
  service        TEXT,
  city           TEXT,
  experience     TEXT,
  source         TEXT,
  ip_address     TEXT,
  user_agent     TEXT,
  payload        JSONB NOT NULL DEFAULT '{}'::jsonb,
  status         TEXT NOT NULL DEFAULT 'new',
  priority       TEXT NOT NULL DEFAULT 'normal',
  assigned_to    TEXT,
  admin_notes    TEXT,
  last_contacted_at TIMESTAMPTZ,
  tags           TEXT[] DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Safe column additions for existing installations
ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS priority         TEXT NOT NULL DEFAULT 'normal';
ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS assigned_to     TEXT;
ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS admin_notes     TEXT;
ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;
ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE website_leads ADD COLUMN IF NOT EXISTS tags            TEXT[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS website_leads_created_at_idx  ON website_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS website_leads_status_idx      ON website_leads (status);
CREATE INDEX IF NOT EXISTS website_leads_form_type_idx   ON website_leads (form_type);
CREATE INDEX IF NOT EXISTS website_leads_email_idx       ON website_leads (email);

-- ─── LEAD NOTES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lead_notes (
  id          BIGSERIAL PRIMARY KEY,
  lead_id     BIGINT NOT NULL REFERENCES website_leads(id) ON DELETE CASCADE,
  admin_email TEXT NOT NULL,
  note        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS lead_notes_lead_id_idx ON lead_notes (lead_id);

-- ─── ADMIN USERS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS athoo_admin_users (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role          TEXT NOT NULL DEFAULT 'manager',
  permissions   JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  login_count   INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE athoo_admin_users ADD COLUMN IF NOT EXISTS login_count INT NOT NULL DEFAULT 0;

-- ─── ACTIVITY LOGS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id          BIGSERIAL PRIMARY KEY,
  admin_email TEXT,
  action      TEXT NOT NULL,
  target_type TEXT,
  target_id   TEXT,
  details     JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON admin_activity_logs (created_at DESC);

-- ─── ADMIN NOTIFICATIONS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_notifications (
  id          BIGSERIAL PRIMARY KEY,
  admin_email TEXT,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  link_to     TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS admin_notifications_created_at_idx ON admin_notifications (created_at DESC);

-- ─── APP SETTINGS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS app_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── EMAIL LOGS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS athoo_email_logs (
  id                BIGSERIAL PRIMARY KEY,
  lead_id           BIGINT,
  recipient         TEXT NOT NULL,
  subject           TEXT NOT NULL,
  body              TEXT,
  status            TEXT NOT NULL DEFAULT 'pending',
  sent_by           TEXT,
  provider_response JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE athoo_email_logs ADD COLUMN IF NOT EXISTS sent_by TEXT;
CREATE INDEX IF NOT EXISTS email_logs_created_at_idx ON athoo_email_logs (created_at DESC);

-- ─── EMAIL TEMPLATES ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS athoo_email_templates (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  subject    TEXT NOT NULL,
  body       TEXT NOT NULL,
  category   TEXT NOT NULL DEFAULT 'general',
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS athoo_email_templates_name_idx ON athoo_email_templates (name);

-- ─── BLOG POSTS ───────────────────────────────────────────────────────────────
-- This table is used by BOTH the public blog API (via Drizzle ORM) and
-- the admin panel (via raw pool queries). Column names must match Drizzle schema.
CREATE TABLE IF NOT EXISTS blog_posts (
  id                    SERIAL PRIMARY KEY,
  slug                  TEXT NOT NULL UNIQUE,
  title                 TEXT NOT NULL,
  excerpt               TEXT NOT NULL DEFAULT '',
  content               TEXT NOT NULL DEFAULT '',
  category              TEXT NOT NULL DEFAULT 'Insights',
  tags                  TEXT[] DEFAULT '{}',
  published_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reading_time_minutes  INTEGER NOT NULL DEFAULT 5,
  image_url             TEXT NOT NULL DEFAULT '',
  meta_title            TEXT,
  meta_description      TEXT,
  author                TEXT NOT NULL DEFAULT 'Athoo Team',
  is_published          BOOLEAN NOT NULL DEFAULT TRUE,
  featured              BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '';
CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON blog_posts (published_at DESC);
CREATE INDEX IF NOT EXISTS blog_posts_is_published_idx ON blog_posts (is_published);

-- ─── BLOG CATEGORIES ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_categories (
  id          SERIAL PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── MEDIA LIBRARY ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS media_library (
  id         BIGSERIAL PRIMARY KEY,
  url        TEXT NOT NULL,
  alt        TEXT NOT NULL DEFAULT '',
  caption    TEXT NOT NULL DEFAULT '',
  type       TEXT NOT NULL DEFAULT 'image',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE media_library ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ─── SERVICE CATEGORIES ───────────────────────────────────────────────────────
-- Used by the admin Services Manager and the public services API.
CREATE TABLE IF NOT EXISTS service_categories (
  id             SERIAL PRIMARY KEY,
  slug           TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  description    TEXT NOT NULL DEFAULT '',
  icon           TEXT NOT NULL DEFAULT 'Wrench',
  cities         TEXT[] NOT NULL DEFAULT '{}'::text[],
  starting_price INTEGER,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS service_categories_slug_idx ON service_categories (slug);

-- =============================================================================
-- DEFAULT SEED DATA
-- =============================================================================

-- Default app settings
INSERT INTO app_settings (key, value) VALUES
  ('maintenance_mode',   '{"enabled":false,"message":"Athoo website is under maintenance. Please check back soon."}'::jsonb),
  ('support_email',      '"official@athoo.pk"'::jsonb),
  ('support_phone',      '"+92 339 0051068"'::jsonb),
  ('site_title',         '"Athoo — Pakistan Smart Home Services"'::jsonb),
  ('site_description',   '"Athoo connects customers with verified home service professionals in Islamabad and Rawalpindi."'::jsonb),
  ('whatsapp_number',    '"923390051068"'::jsonb),
  ('social_instagram',   '"https://instagram.com/athoo_services"'::jsonb),
  ('social_facebook',    '"https://facebook.com/Athoo.Services/"'::jsonb),
  ('social_tiktok',      '"https://tiktok.com/@athoo.pk"'::jsonb),
  ('social_linkedin',    '"https://linkedin.com/company/123424195"'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Default email templates
INSERT INTO athoo_email_templates (name, subject, body, category) VALUES
  ('Waitlist Welcome',
   'Welcome to the Athoo Waitlist!',
   'Hi {{name}},\n\nThank you for joining the Athoo waitlist! We are building Pakistan''s smartest home services platform and you will be among the first to know when we launch in Islamabad and Rawalpindi.\n\nFollow us on Instagram @athoo_services for updates.\n\nThe Athoo Team\nofficial@athoo.pk',
   'waitlist'),
  ('Provider Onboarding',
   'Your Athoo Provider Application Has Been Received',
   'Hi {{name}},\n\nThank you for registering as a service provider on Athoo! We have received your application for {{service}} services.\n\nWe will contact you at {{phone}} when provider onboarding officially opens in your area.\n\nFor questions: official@athoo.pk | WhatsApp: +92 339 0051068\n\nAthoo Team',
   'provider'),
  ('Provider Approved',
   'Congratulations — You Are Approved as an Athoo Provider!',
   'Hi {{name}},\n\nCongratulations! Your application to join Athoo as a {{service}} provider has been approved. Welcome to the Athoo network!\n\nWe will be in touch with next steps for your onboarding.\n\nAthoo Team\nofficial@athoo.pk',
   'provider'),
  ('Launch Notification',
   'Athoo Is Launching in Rawalpindi & Islamabad!',
   'Hi {{name}},\n\nGreat news — Athoo is launching! You are on our waitlist and will be among the first to access Pakistan''s smartest home services platform.\n\nBook verified plumbers, electricians, AC technicians, cleaners, and more — all through one app.\n\nStay tuned!\nThe Athoo Team',
   'general'),
  ('Inquiry Response',
   'Re: Your Athoo Inquiry',
   'Hi {{name}},\n\nThank you for reaching out to Athoo. We have received your message and our team will respond within 1–2 business days.\n\nFor urgent matters: WhatsApp +92 339 0051068.\n\nAthoo Support\nofficial@athoo.pk',
   'general')
ON CONFLICT (name) DO NOTHING;

-- Default service categories
INSERT INTO service_categories (slug, name, description, icon, cities, starting_price, is_active, sort_order) VALUES
  ('plumber',       'Plumber',              'Pipe repairs, leaks, installations, blockages',          'Droplets',   '{Islamabad,Rawalpindi}', 1500, true, 1),
  ('electrician',   'Electrician',          'Wiring, fuse panels, fixtures, power issues',            'Zap',        '{Islamabad,Rawalpindi}', 1500, true, 2),
  ('ac-repair',     'AC Repair & Service',  'AC servicing, gas refill, repair, installation',         'Wind',       '{Islamabad,Rawalpindi}', 2000, true, 3),
  ('carpenter',     'Carpenter',            'Furniture repair, custom woodwork, door fitting',         'Hammer',     '{Islamabad,Rawalpindi}', 2000, true, 4),
  ('painter',       'Painter',              'Interior and exterior painting, whitewash, touch-ups',   'PaintBucket','{Islamabad,Rawalpindi}', 5000, true, 5),
  ('cleaner',       'Home Cleaning',        'Deep cleaning, regular cleaning, move-in/out cleaning',  'Sparkles',   '{Islamabad,Rawalpindi}', 3000, true, 6),
  ('pest-control',  'Pest Control',         'Fumigation, cockroach/termite/rodent treatment',         'Bug',        '{Islamabad,Rawalpindi}', 3500, true, 7),
  ('handyman',      'Handyman',             'General repairs, TV mounting, minor fixes around home',   'Wrench',     '{Islamabad,Rawalpindi}', 1000, true, 8),
  ('cctv',          'CCTV & Security',      'Camera installation, DVR setup, security systems',        'Camera',     '{Islamabad,Rawalpindi}', 5000, true, 9),
  ('solar',         'Solar Installation',   'Solar panels, inverters, battery systems',                'Sun',        '{Islamabad,Rawalpindi}', 50000,true, 10)
ON CONFLICT (slug) DO NOTHING;

-- Default blog categories
INSERT INTO blog_categories (slug, name, description) VALUES
  ('insights',       'Insights',       'Industry insights and market reports'),
  ('about-athoo',    'About Athoo',    'News and updates about Athoo platform'),
  ('customer-tips',  'Customer Tips',  'Tips for customers hiring professionals'),
  ('trust-safety',   'Trust & Safety', 'How to hire safely and avoid scams'),
  ('provider-tips',  'Provider Tips',  'Tips for service providers and professionals'),
  ('plumbing',       'Plumbing',       'Plumbing tips, guides and how-tos')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- ADMIN USER SETUP
-- =============================================================================
-- The admin panel auto-seeds a super_admin from the ADMIN_PASSWORD environment
-- variable at startup (via dbInit.ts). To create an admin manually, use the
-- admin panel's "Admin Users" section after logging in, OR run:
--
--   INSERT INTO athoo_admin_users (name, email, role, is_active)
--   VALUES ('Your Name', 'your@email.com', 'super_admin', true);
--
-- Then set the password from the Admin Users panel or by updating password_hash
-- using the same PBKDF2 method in admin-panel.ts hashPassword().
-- =============================================================================
