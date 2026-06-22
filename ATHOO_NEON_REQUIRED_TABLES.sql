-- Athoo required Neon tables for website, admin panel, forms, maintenance mode, blog, services, media and email logs.
-- Run once in Neon SQL Editor before testing production API.

CREATE TABLE IF NOT EXISTS leads (
  id serial PRIMARY KEY,
  form_type varchar(100) NOT NULL,
  name text,
  email text,
  phone varchar(50),
  subject text,
  message text,
  service text,
  city text,
  experience text,
  source text,
  status varchar(50) NOT NULL DEFAULT 'new',
  priority varchar(50) DEFAULT 'normal',
  assigned_to text,
  admin_notes text,
  last_contacted_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id serial PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role varchar(50) NOT NULL DEFAULT 'manager',
  is_active boolean NOT NULL DEFAULT true,
  permissions json,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value jsonb DEFAULT '{}'::jsonb,
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id serial PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'Insights',
  excerpt text,
  content text,
  author text DEFAULT 'Athoo Team',
  status varchar(50) NOT NULL DEFAULT 'draft',
  published_at text,
  cover_image text,
  read_time text,
  featured boolean DEFAULT false,
  meta_title text,
  meta_description text,
  tags json,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blog_categories (
  id serial PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_templates (
  id serial PRIMARY KEY,
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  category varchar(100) DEFAULT 'general',
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_logs (
  id serial PRIMARY KEY,
  recipient text NOT NULL,
  subject text NOT NULL,
  status varchar(50) NOT NULL DEFAULT 'sent',
  sent_by text,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media_items (
  id serial PRIMARY KEY,
  url text NOT NULL,
  alt text,
  caption text,
  type varchar(50) DEFAULT 'image',
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
  id serial PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon text DEFAULT 'Wrench',
  starting_price text,
  cities text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id serial PRIMARY KEY,
  admin_email text NOT NULL,
  action text NOT NULL,
  target_type text,
  target_id text,
  ip_address text,
  created_at timestamp NOT NULL DEFAULT now()
);

INSERT INTO site_settings (key, value) VALUES
  ('maintenance', '{"enabled": false, "message": "Athoo website is under maintenance."}'::jsonb),
  ('cms', '{}'::jsonb),
  ('contact', '{"email":"official@athoo.pk","phone":"+92 339 0051068"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO blog_categories (name, slug, description) VALUES
  ('Home Services', 'home-services', 'Home services guides and updates'),
  ('Athoo Updates', 'athoo-updates', 'Athoo platform news')
ON CONFLICT (slug) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_form_type ON leads(form_type);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
