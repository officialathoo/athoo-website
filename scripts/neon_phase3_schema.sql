-- ============================================================
-- Athoo Phase 3 — Neon PostgreSQL Schema
-- Safe to run multiple times. Does not drop existing data.
-- Creates/updates tables needed for website leads, admin panel,
-- blog CMS, media library, settings, roles, email templates and SEO.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS website_leads (
  id BIGSERIAL PRIMARY KEY,
  form_type TEXT NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  subject TEXT,
  message TEXT,
  service TEXT,
  city TEXT,
  experience TEXT,
  source TEXT,
  ip_address TEXT,
  user_agent TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'new',
  priority TEXT NOT NULL DEFAULT 'normal',
  assigned_to TEXT,
  admin_notes TEXT,
  last_contacted_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS website_leads_created_at_idx ON website_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS website_leads_status_idx ON website_leads (status);
CREATE INDEX IF NOT EXISTS website_leads_form_type_idx ON website_leads (form_type);
CREATE INDEX IF NOT EXISTS website_leads_email_idx ON website_leads (email);

CREATE TABLE IF NOT EXISTS lead_notes (
  id BIGSERIAL PRIMARY KEY,
  lead_id BIGINT NOT NULL REFERENCES website_leads(id) ON DELETE CASCADE,
  admin_email TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS lead_notes_lead_id_idx ON lead_notes (lead_id);

CREATE TABLE IF NOT EXISTS athoo_admin_users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'manager',
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  login_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_email TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS admin_activity_logs_created_at_idx ON admin_activity_logs (created_at DESC);

CREATE TABLE IF NOT EXISTS admin_notifications (
  id BIGSERIAL PRIMARY KEY,
  admin_email TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_to TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS athoo_email_logs (
  id BIGSERIAL PRIMARY KEY,
  lead_id BIGINT,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_by TEXT,
  provider_response JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS athoo_email_templates (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT NOT NULL DEFAULT 'Insights',
  author TEXT NOT NULL DEFAULT 'Athoo Team',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  cover_image TEXT,
  read_time TEXT,
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS read_time TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;
CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON blog_posts (status);
CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON blog_posts (published_at DESC NULLS LAST);

CREATE TABLE IF NOT EXISTS blog_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_tags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id BIGINT NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
CREATE INDEX IF NOT EXISTS blog_post_tags_post_idx ON blog_post_tags (post_id);

CREATE TABLE IF NOT EXISTS media_library (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  caption TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'image' CHECK (type IN ('image','video','document')),
  uploaded_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS media_library_type_idx ON media_library (type);

CREATE TABLE IF NOT EXISTS cms_pages (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_sections (
  id SERIAL PRIMARY KEY,
  page_id INTEGER REFERENCES cms_pages(id) ON DELETE CASCADE,
  section_key TEXT,
  key TEXT,
  label TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  label TEXT,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (role_id, permission)
);

CREATE TABLE IF NOT EXISTS seo_settings (
  id SERIAL PRIMARY KEY,
  page_slug TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  canonical_url TEXT,
  og_image TEXT,
  schema_json JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_links (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_requests (
  id BIGSERIAL PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  priority TEXT NOT NULL DEFAULT 'normal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION athoo_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_website_leads_updated_at') THEN
    CREATE TRIGGER trg_website_leads_updated_at BEFORE UPDATE ON website_leads FOR EACH ROW EXECUTE FUNCTION athoo_set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_blog_posts_updated_at') THEN
    CREATE TRIGGER trg_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION athoo_set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_media_library_updated_at') THEN
    CREATE TRIGGER trg_media_library_updated_at BEFORE UPDATE ON media_library FOR EACH ROW EXECUTE FUNCTION athoo_set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cms_pages_updated_at') THEN
    CREATE TRIGGER trg_cms_pages_updated_at BEFORE UPDATE ON cms_pages FOR EACH ROW EXECUTE FUNCTION athoo_set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_support_requests_updated_at') THEN
    CREATE TRIGGER trg_support_requests_updated_at BEFORE UPDATE ON support_requests FOR EACH ROW EXECUTE FUNCTION athoo_set_updated_at();
  END IF;
END $$;

INSERT INTO blog_categories (name, slug) VALUES
  ('Insights','insights'), ('About Athoo','about-athoo'), ('Customer Tips','customer-tips'),
  ('Trust & Safety','trust-and-safety'), ('Provider Tips','provider-tips'), ('News','news')
ON CONFLICT (name) DO NOTHING;

INSERT INTO roles (name, label, description, is_system) VALUES
  ('super_admin','Super Admin','Full system access', TRUE),
  ('admin','Admin','Full access except user management', TRUE),
  ('manager','Manager','Manage leads and content', TRUE),
  ('custom','Custom','Custom permissions defined per user', FALSE)
ON CONFLICT (name) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description;

INSERT INTO role_permissions (role_id, permission, granted)
SELECT r.id, p.permission, TRUE
FROM roles r
CROSS JOIN (VALUES
  ('all'), ('leads'), ('blogs'), ('email'), ('settings'), ('media'), ('faq'), ('seo'), ('admins')
) AS p(permission)
WHERE r.name = 'super_admin'
ON CONFLICT (role_id, permission) DO NOTHING;

INSERT INTO app_settings (key, value) VALUES
  ('seo_settings', '{"siteTitle":"Athoo | Trusted Home Services in Rawalpindi & Islamabad","siteDescription":"Book verified home service professionals for plumbing, electrical, AC repair, cleaning, carpentry, painting, appliance repair and home maintenance.","ogImage":"https://athoo.pk/opengraph.jpg"}'::jsonb),
  ('social_links', '{"instagram":"https://instagram.com/athoo_services","facebook":"https://facebook.com/Athoo.Services/","tiktok":"https://tiktok.com/@athoo.pk","linkedin":"https://www.linkedin.com/company/123424195","whatsapp":"923390051068"}'::jsonb),
  ('support_email', '"support@athoo.pk"'::jsonb),
  ('support_phone', '"+92 339 0051068"'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO social_links (platform, url, is_active, sort_order) VALUES
  ('Instagram','https://instagram.com/athoo_services', TRUE, 1),
  ('Facebook','https://www.facebook.com/Athoo.Services/', TRUE, 2),
  ('TikTok','https://www.tiktok.com/@athoo.pk', TRUE, 3),
  ('LinkedIn','https://www.linkedin.com/company/123424195', TRUE, 4),
  ('WhatsApp','https://wa.me/923390051068', TRUE, 5)
ON CONFLICT (platform) DO UPDATE SET url = EXCLUDED.url, is_active = TRUE, sort_order = EXCLUDED.sort_order;

INSERT INTO athoo_email_templates (name, subject, body, category) VALUES
  ('Waitlist Welcome','Welcome to Athoo Waitlist!','Hi {{name}},\n\nThank you for joining the Athoo waitlist. We will notify you as soon as we launch.\n\nRegards,\nAthoo Team','waitlist'),
  ('Provider Onboarding','Athoo Provider Application Received','Hi {{name}},\n\nThank you for registering as a service provider on Athoo. Our team will review your application and contact you soon.\n\nRegards,\nAthoo Team','provider'),
  ('Contact Received','Athoo has received your message','Hi {{name}},\n\nThank you for contacting Athoo. Our support team will review your message and respond soon.\n\nRegards,\nAthoo Team','contact')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- END Athoo Phase 3 schema
-- ============================================================
