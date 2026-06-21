import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  AlertTriangle, BarChart3, Bell, BookOpen, CheckCircle2, Copy, Download,
  Eye, EyeOff, FileText, Globe, HelpCircle, ImageIcon, KeyRound,
  LayoutDashboard, Layers, Link2, Lock, LogOut, Mail, Menu, MessageSquare,
  Package, Pencil, Plus, RefreshCw, Search, Send, ShieldCheck,
  SlidersHorizontal, Tag, Trash2, UserCog, Users, Wrench, X, Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BlogEditor } from "@/components/blog-editor/BlogEditor";

function resolveApiBase(): string {
  const configured = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  if (configured && configured !== 'https://api.athoo.pk') return configured;
  return 'https://thoo-api.onrender.com';
}
const API_BASE = resolveApiBase();
const apiUrl = (path: string) => API_BASE + path;
const noStoreHeaders = (token: string) => ({ Authorization: `Bearer ${token}`, "Cache-Control": "no-cache" });

const roles = ["super_admin", "admin", "manager", "custom"];
const statuses = ["new", "contacted", "approved", "rejected", "closed"];
const priorities = ["normal", "high", "urgent"];
const BLOG_CATEGORIES = ["Insights", "About Athoo", "Customer Tips", "Trust & Safety", "Provider Tips", "News"];
const FAQ_CATEGORIES = ["General", "Customers", "Providers", "Payments", "Technical"];

type AdminTab =
  | "dashboard" | "leads" | "waitlist" | "providers" | "contacts" | "support"
  | "email" | "blogs" | "templates" | "media" | "faq" | "seo" | "social"
  | "admins" | "activity" | "settings"
  | "blog-categories" | "cms" | "services" | "roles" | "database";

type AdminUser = { id?: number; name: string; email: string; role: string; is_active?: boolean; permissions?: Record<string, boolean> };
type Lead = {
  id: number; form_type: string; name?: string | null; email?: string | null; phone?: string | null;
  subject?: string | null; message?: string | null; service?: string | null; city?: string | null; experience?: string | null;
  source?: string | null; status: string; priority?: string | null; assigned_to?: string | null; admin_notes?: string | null;
  last_contacted_at?: string | null; created_at: string; updated_at?: string | null;
};
type Stats = { total: number; today: number; providers: number; waitlist: number; contacts: number; new_leads: number };
type Activity = { admin_email: string; action: string; target_type: string; target_id: string; ip_address: string; created_at: string };
type Settings = { maintenance_mode?: { enabled: boolean; message: string }; support_email?: string; support_phone?: string };
type BlogPost = {
  id: number; title: string; slug: string; category: string; excerpt: string; content: string;
  author: string; status: "draft" | "published"; publishedAt: string; coverImage?: string;
  readTime?: string; featured?: boolean; metaTitle?: string; metaDescription?: string;
  tags?: string[];
};
type FaqItem = { id: number; q: string; a: string; category: string };
type MediaItem = { id: number; url: string; alt: string; caption: string; type: string; createdAt: string };

const TAB_LABELS: Record<AdminTab, string> = {
  dashboard: "Dashboard", leads: "All Leads", waitlist: "Waitlist", providers: "Provider Requests",
  contacts: "Contact Messages", support: "Support Requests", email: "Bulk Email", blogs: "Blog CMS",
  templates: "Email Templates", media: "Media Library", faq: "FAQ Manager", seo: "SEO Settings",
  social: "Social Links", admins: "Admin Users", activity: "Activity Logs", settings: "Site Settings",
  "blog-categories": "Blog Categories", cms: "CMS Content", services: "Services Manager",
  roles: "Roles & Permissions", database: "Database Tools",
};

const SIDEBAR_SECTIONS: { label: string; items: { tab: AdminTab; icon: any; label: string }[] }[] = [
  { label: "Overview", items: [{ tab: "dashboard", icon: LayoutDashboard, label: "Dashboard" }] },
  { label: "Leads & CRM", items: [
    { tab: "leads", icon: Users, label: "All Leads" },
    { tab: "waitlist", icon: Bell, label: "Waitlist" },
    { tab: "providers", icon: ShieldCheck, label: "Provider Requests" },
    { tab: "contacts", icon: MessageSquare, label: "Contact Messages" },
    { tab: "support", icon: HelpCircle, label: "Support Requests" },
  ]},
  { label: "Communication", items: [
    { tab: "email", icon: Mail, label: "Bulk Email" },
    { tab: "templates", icon: FileText, label: "Email Templates" },
  ]},
  { label: "Content", items: [
    { tab: "blogs", icon: BookOpen, label: "Blog CMS" },
    { tab: "media", icon: ImageIcon, label: "Media Library" },
    { tab: "faq", icon: HelpCircle, label: "FAQ Manager" },
  ]},
  { label: "Website", items: [
    { tab: "seo", icon: Globe, label: "SEO Settings" },
    { tab: "social", icon: Link2, label: "Social Links" },
    { tab: "settings", icon: Wrench, label: "Site Settings" },
  ]},
  { label: "System", items: [
    { tab: "admins", icon: UserCog, label: "Admin Users" },
    { tab: "activity", icon: BarChart3, label: "Activity Logs" },
  ]},
  { label: "Tools", items: [
    { tab: "blog-categories", icon: Tag, label: "Blog Categories" },
    { tab: "cms", icon: Layers, label: "CMS Content" },
    { tab: "services", icon: Package, label: "Services Manager" },
    { tab: "roles", icon: KeyRound, label: "Roles & Perms" },
    { tab: "database", icon: Database, label: "Database Tools" },
  ]},
];

const FORM_TYPE_MAP: Partial<Record<AdminTab, string>> = {
  waitlist: "Waitlist Signup",
  providers: "Provider Waitlist",
  contacts: "Contact Form",
  support: "Support Request",
};

function authHeaders(token: string) { return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }; }
function prettyRole(role: string) { return role.replace("_", " ").replace(/\b\w/g, (m) => m.toUpperCase()); }

const defaultBlogForm: Partial<BlogPost> = {
  title: "", slug: "", category: "Insights", excerpt: "", content: "",
  author: "Athoo Team", status: "draft",
  publishedAt: new Date().toISOString().slice(0, 10),
  coverImage: "", readTime: "", featured: false, metaTitle: "", metaDescription: "",
};

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem("athoo_admin_token") || "");
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    try { return JSON.parse(localStorage.getItem("athoo_admin_user") || "null"); } catch { return null; }
  });
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, today: 0, providers: 0, waitlist: 0, contacts: 0, new_leads: 0 });
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [settings, setSettings] = useState<Settings>({});
  const [filters, setFilters] = useState({ search: "", formType: "", status: "", priority: "", assignedTo: "", dateFrom: "", dateTo: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [emailDraft, setEmailDraft] = useState({ subject: "Athoo Launch Update", message: "Hi {{name}},\n\nThank you for joining Athoo.\n\nRegards,\nAthoo Team" });
  const [adminForm, setAdminForm] = useState<AdminUser & { password?: string }>({ name: "", email: "", role: "manager", password: "", is_active: true });
  const [maintenance, setMaintenance] = useState({ enabled: false, message: "Athoo website is under maintenance. Please check back soon.", supportEmail: "official@athoo.pk", supportPhone: "+92 339 0051068" });

  // Blog CMS state
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [blogForm, setBlogForm] = useState<Partial<BlogPost>>(defaultBlogForm);
  const [editingBlog, setEditingBlog] = useState<number | null>(null);
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogSearch, setBlogSearch] = useState("");
  const [blogStatusFilter, setBlogStatusFilter] = useState("");
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Global search
  const [searchOpen, setSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  // Leads pagination
  const PAGE_SIZE = 25;
  const [page, setPage] = useState(0);
  // Blog extras
  const [blogTagsInput, setBlogTagsInput] = useState("");
  // Blog categories
  const [blogCats, setBlogCats] = useState<{ id: number; name: string; slug: string; description?: string }[]>([]);
  const [blogCatForm, setBlogCatForm] = useState({ name: "", description: "" });
  // DB stats
  const [dbStats, setDbStats] = useState<{ table: string; count: number }[]>([]);

  // SEO state
  const [seoForm, setSeoForm] = useState({ siteTitle: "Athoo — Pakistan Smart Home Services", siteDescription: "Athoo connects customers with verified home service professionals in Rawalpindi & Islamabad.", ogImage: "https://www.athoo.pk/opengraph.jpg", googleVerification: "", bingVerification: "" });

  // Social links state
  const [socialForm, setSocialForm] = useState({ instagram: "https://instagram.com/athoo_services", facebook: "https://facebook.com/Athoo.Services/", tiktok: "https://tiktok.com/@athoo.pk", linkedin: "https://linkedin.com/company/123424195", youtube: "", twitter: "", whatsapp: "923390051068" });

  // FAQ manager state
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [faqForm, setFaqForm] = useState({ q: "", a: "", category: "General" });
  const [editingFaqId, setEditingFaqId] = useState<number | null>(null);

  // Media library state
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaForm, setMediaForm] = useState({ url: "", alt: "", caption: "", type: "image" });
  const [extLoading, setExtLoading] = useState(false);

  // Services Manager state
  const [services, setServices] = useState<any[]>([]);
  const [svcForm, setSvcForm] = useState({ name: "", description: "", icon: "Wrench", startingPrice: "", cities: "Islamabad, Rawalpindi", isActive: true, sortOrder: 0 });
  const [editingSvc, setEditingSvc] = useState<number | null>(null);
  const [svcLoading, setSvcLoading] = useState(false);

  // CMS Hero state
  const [cmsForm, setCmsForm] = useState({ badge: "App Launching Soon in Pakistan", heroTitle: "Pakistan's Smart Home Services App Launching Soon", heroSubtitle: "Connecting Islamabad & Rawalpindi with certified plumbers, electricians, AC technicians, carpenters, cleaners and more.", launchDate: "", supportEmail: "official@athoo.pk", supportPhone: "+92 339 0051068", whatsapp: "923390051068", siteTitle: "Athoo — Pakistan Smart Home Services", siteDescription: "Athoo is Pakistan's upcoming smart home services app." });
  const [cmsLoading, setCmsLoading] = useState(false);

  // Email logs
  const [emailLogs, setEmailLogs] = useState<{id:number;recipient:string;subject:string;status:string;sent_by?:string;created_at:string}[]>([]);
  const [emailProgress, setEmailProgress] = useState("");
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Email templates
  const defaultTemplates = [
    { id: 1, name: "Launch Notification", subject: "Athoo Is Launching in Rawalpindi & Islamabad!", body: "Hi {{name}},\n\nGreat news! Athoo is launching soon in Rawalpindi and Islamabad. You're on our waitlist and will be among the first to know.\n\nThe Athoo Team\nsupport@athoo.pk" },
    { id: 2, name: "Provider Onboarding", subject: "Your Athoo Provider Registration Has Been Received", body: "Hi {{name}},\n\nThank you for registering as a service provider on Athoo. We will contact you at {{phone}} when provider onboarding officially opens.\n\nIf you have questions, email official@athoo.pk or WhatsApp: +92 339 0051068.\n\nRegards,\nAthoo Team" },
    { id: 3, name: "Provider Approved", subject: "You're Approved as an Athoo Provider!", body: "Hi {{name}},\n\nCongratulations! Your application to join Athoo as a {{service}} provider has been approved.\n\nWelcome to the Athoo network!\n\nAthoo Team" },
    { id: 4, name: "Inquiry Response", subject: "Re: Your Athoo Inquiry", body: "Hi {{name}},\n\nThank you for reaching out to Athoo. We've received your message and our team will respond within 1–2 business days.\n\nFor urgent matters: WhatsApp +92 339 0051068.\n\nAthoo Support\nsupport@athoo.pk" },
    { id: 5, name: "Waitlist Confirmation", subject: "You're on the Athoo Waitlist!", body: "Hi {{name}},\n\nWelcome to the Athoo waitlist! Follow us on Instagram @athoo_services for updates.\n\nThe Athoo Team" },
  ];
  const [templates, setTemplates] = useState(defaultTemplates);
  const [editingTemplate, setEditingTemplate] = useState<number | null>(null);
  const [templateForm, setTemplateForm] = useState({ name: "", subject: "", body: "" });

  // ── Blog API ────────────────────────────────────────────────────────────────
  async function loadBlogs() {
    if (!token) return;
    setBlogLoading(true);
    try {
      const r = await fetch(apiUrl("/api/admin/blog/posts"), { headers: noStoreHeaders(token) });
      const d = await r.json();
      if (r.status === 401) { logout(); return; }
      if (r.ok) setBlogs((d.posts || []).map((p: any) => ({ ...p, coverImage: p.cover_image, readTime: p.read_time, metaTitle: p.meta_title, metaDescription: p.meta_description, publishedAt: p.published_at ? String(p.published_at).slice(0, 10) : "" })));
    } catch { }
    finally { setBlogLoading(false); }
  }

  async function saveBlog() {
    if (!blogForm.title || !blogForm.slug) return setError("Title and slug are required.");
    setBlogLoading(true); setError(""); setNotice("");
    try {
      const method = editingBlog !== null ? "PUT" : "POST";
      const url = editingBlog !== null ? `/api/admin/blog/posts/${editingBlog}` : "/api/admin/blog/posts";
      const r = await fetch(apiUrl(url), { method, headers: authHeaders(token), body: JSON.stringify(blogForm) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not save post");
      setNotice(editingBlog !== null ? "Blog post updated." : "Blog post created.");
      resetBlogForm(); await loadBlogs();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save post"); }
    finally { setBlogLoading(false); }
  }

  async function deleteBlog(id: number) {
    if (!window.confirm("Delete this blog post?")) return;
    setBlogLoading(true); setError(""); setNotice("");
    try {
      const r = await fetch(apiUrl(`/api/admin/blog/posts/${id}`), { method: "DELETE", headers: noStoreHeaders(token) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Delete failed");
      setNotice("Blog post deleted."); await loadBlogs();
    } catch (err) { setError(err instanceof Error ? err.message : "Delete failed"); }
    finally { setBlogLoading(false); }
  }

  function editBlog(b: BlogPost) { setBlogForm({ ...b }); setEditingBlog(b.id); setBlogTagsInput((b.tags || []).join(", ")); }
  function resetBlogForm() { setBlogForm({ ...defaultBlogForm, publishedAt: new Date().toISOString().slice(0, 10) }); setEditingBlog(null); setBlogTagsInput(""); }

  function insertHtml(tag: string, attrs = "") {
    const ta = contentRef.current; if (!ta) return;
    const s = ta.selectionStart, e2 = ta.selectionEnd, sel = ta.value.slice(s, e2);
    const open = attrs ? `<${tag} ${attrs}>` : `<${tag}>`, close = `</${tag}>`;
    const next = ta.value.slice(0, s) + open + sel + close + ta.value.slice(e2);
    setBlogForm(f => ({ ...f, content: next }));
    setTimeout(() => { ta.focus(); ta.selectionStart = s + open.length; ta.selectionEnd = s + open.length + sel.length; }, 0);
  }

  // ── Extended settings (SEO, Social, FAQ, Media) ──────────────────────────────
  async function loadExtendedSettings() {
    if (!token) return;
    setExtLoading(true);
    try {
      const r = await fetch(apiUrl("/api/admin/settings"), { headers: noStoreHeaders(token) });
      const d = await r.json();
      if (!r.ok) return;
      const s = d.settings || {};
      if (s.seo_settings) setSeoForm(f => ({ ...f, ...s.seo_settings }));
      if (s.social_links) setSocialForm(f => ({ ...f, ...s.social_links }));
      else {
        setSocialForm(f => ({
          ...f,
          instagram: s.social_instagram || f.instagram,
          facebook: s.social_facebook || f.facebook,
          tiktok: s.social_tiktok || f.tiktok,
          linkedin: s.social_linkedin || f.linkedin,
          whatsapp: s.whatsapp_number || f.whatsapp,
        }));
      }
      if (Array.isArray(s.site_faqs)) setFaqItems(s.site_faqs);
      if (Array.isArray(s.media_library)) setMediaItems(s.media_library);
    } catch { }
    finally { setExtLoading(false); }
  }

  async function upsertSetting(key: string, value: unknown) {
    const r = await fetch(apiUrl("/api/admin/upsert-setting"), { method: "POST", headers: authHeaders(token), body: JSON.stringify({ key, value }) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "Could not save setting");
    return d;
  }

  async function saveSeoSettings(e: React.FormEvent) {
    e.preventDefault(); setError(""); setNotice("");
    try { await upsertSetting("seo_settings", seoForm); setNotice("SEO settings saved."); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not save SEO settings"); }
  }

  async function saveSocialLinks(e: React.FormEvent) {
    e.preventDefault(); setError(""); setNotice("");
    try { await upsertSetting("social_links", socialForm); setNotice("Social links saved."); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not save social links"); }
  }

  async function saveFaqItem() {
    if (!faqForm.q || !faqForm.a) return setError("Question and answer are required.");
    setError(""); setNotice("");
    const updated = editingFaqId !== null
      ? faqItems.map(f => f.id === editingFaqId ? { ...f, ...faqForm } : f)
      : [...faqItems, { id: Date.now(), ...faqForm }];
    try { await upsertSetting("site_faqs", updated); setFaqItems(updated); setFaqForm({ q: "", a: "", category: "General" }); setEditingFaqId(null); setNotice("FAQ saved."); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not save FAQ"); }
  }

  async function deleteFaqItem(id: number) {
    const updated = faqItems.filter(f => f.id !== id);
    try { await upsertSetting("site_faqs", updated); setFaqItems(updated); setNotice("FAQ deleted."); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not delete FAQ"); }
  }

  async function saveMediaItem() {
    if (!mediaForm.url) return setError("URL is required.");
    setError(""); setNotice(""); setExtLoading(true);
    try {
      const r = await fetch(apiUrl("/api/admin/media"), { method: "POST", headers: authHeaders(token), body: JSON.stringify(mediaForm) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not save media");
      setMediaItems(items => [...items, { ...d.item, createdAt: d.item.created_at }]);
      setMediaForm({ url: "", alt: "", caption: "", type: "image" });
      setNotice("Media saved.");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save media"); }
    finally { setExtLoading(false); }
  }

  async function deleteMediaItem(id: number) {
    setError(""); setNotice("");
    try {
      const r = await fetch(apiUrl(`/api/admin/media/${id}`), { method: "DELETE", headers: noStoreHeaders(token) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Delete failed");
      setMediaItems(items => items.filter(m => m.id !== id));
      setNotice("Media deleted.");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not delete media"); }
  }

  async function loadMediaFromApi() {
    if (!token) return; setExtLoading(true);
    try {
      const r = await fetch(apiUrl("/api/admin/media"), { headers: noStoreHeaders(token) });
      const d = await r.json();
      if (d.ok) setMediaItems(d.items.map((m: any) => ({ ...m, createdAt: m.created_at })));
    } catch { } finally { setExtLoading(false); }
  }

  async function loadTemplatesFromApi() {
    if (!token) return;
    try {
      const r = await fetch(apiUrl("/api/admin/templates"), { headers: noStoreHeaders(token) });
      const d = await r.json();
      if (d.ok && (d.rows || d.templates)?.length) setTemplates(d.rows || d.templates);
    } catch { }
  }

  async function loadBlogCatsFromApi() {
    try {
      const r = await fetch(apiUrl("/api/public/blog/categories"));
      const d = await r.json();
      if (d.ok) setBlogCats(d.categories || []);
    } catch { }
  }

  async function saveBlogCategory() {
    if (!blogCatForm.name) return setError("Category name is required.");
    setError(""); setNotice("");
    try {
      const r = await fetch(apiUrl("/api/admin/blog/categories"), { method: "POST", headers: authHeaders(token), body: JSON.stringify(blogCatForm) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not save");
      setBlogCats(cats => [...cats, d.category]);
      setBlogCatForm({ name: "", description: "" });
      setNotice("Category added.");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save category"); }
  }

  async function deleteBlogCategory(id: number) {
    if (!window.confirm("Delete this category?")) return;
    try {
      await fetch(apiUrl(`/api/admin/blog/categories/${id}`), { method: "DELETE", headers: noStoreHeaders(token) });
      setBlogCats(cats => cats.filter(c => c.id !== id));
      setNotice("Category deleted.");
    } catch { }
  }

  async function loadDbStats() {
    if (!token) return;
    try {
      const r = await fetch(apiUrl("/api/admin/db-stats"), { headers: noStoreHeaders(token) });
      const d = await r.json();
      if (d.ok) setDbStats(d.stats || []);
    } catch { }
  }

  // ── Services Manager API ─────────────────────────────────────────────────────
  async function loadServices() {
    if (!token) return;
    setSvcLoading(true);
    try {
      const r = await fetch(apiUrl("/api/admin/services"), { headers: noStoreHeaders(token) });
      const d = await r.json();
      if (d.ok) setServices(d.services || []);
    } catch { } finally { setSvcLoading(false); }
  }

  async function saveService(e: React.FormEvent) {
    e.preventDefault(); setError(""); setNotice("");
    setSvcLoading(true);
    try {
      const method = editingSvc !== null ? "PUT" : "POST";
      const url = editingSvc !== null ? `/api/admin/services/${editingSvc}` : "/api/admin/services";
      const body = { ...svcForm, cities: svcForm.cities.split(",").map((c: string) => c.trim()).filter(Boolean), startingPrice: svcForm.startingPrice ? Number(svcForm.startingPrice) : null };
      const r = await fetch(apiUrl(url), { method, headers: authHeaders(token), body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not save service");
      setNotice("Service saved."); setEditingSvc(null);
      setSvcForm({ name: "", description: "", icon: "Wrench", startingPrice: "", cities: "Islamabad, Rawalpindi", isActive: true, sortOrder: 0 });
      await loadServices();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save service"); }
    finally { setSvcLoading(false); }
  }

  async function deleteService(id: number) {
    if (!window.confirm("Delete this service?")) return;
    try {
      await fetch(apiUrl(`/api/admin/services/${id}`), { method: "DELETE", headers: noStoreHeaders(token) });
      setNotice("Service deleted."); await loadServices();
    } catch { setError("Could not delete service"); }
  }

  // ── CMS Settings API ─────────────────────────────────────────────────────────
  async function loadCmsSettings() {
    if (!token) return;
    setCmsLoading(true);
    try {
      const r = await fetch(apiUrl("/api/admin/settings"), { headers: noStoreHeaders(token) });
      const d = await r.json();
      if (d.ok && d.settings) {
        const s = d.settings;
        setCmsForm(f => ({
          ...f,
          badge: s.cms_hero_badge ?? f.badge,
          heroTitle: s.cms_hero_title ?? f.heroTitle,
          heroSubtitle: s.cms_hero_subtitle ?? f.heroSubtitle,
          launchDate: s.cms_launch_date ?? f.launchDate,
          supportEmail: s.support_email ?? f.supportEmail,
          supportPhone: s.support_phone ?? f.supportPhone,
          whatsapp: s.whatsapp_number ?? f.whatsapp,
          siteTitle: s.site_title ?? f.siteTitle,
          siteDescription: s.site_description ?? f.siteDescription,
        }));
      }
    } catch { } finally { setCmsLoading(false); }
  }

  async function saveCmsSettings(e: React.FormEvent) {
    e.preventDefault(); setError(""); setNotice("");
    setCmsLoading(true);
    try {
      const settings = [
        { key: "cms_hero_badge",      value: cmsForm.badge },
        { key: "cms_hero_title",      value: cmsForm.heroTitle },
        { key: "cms_hero_subtitle",   value: cmsForm.heroSubtitle },
        { key: "cms_launch_date",     value: cmsForm.launchDate },
        { key: "support_email",       value: cmsForm.supportEmail },
        { key: "support_phone",       value: cmsForm.supportPhone },
        { key: "whatsapp_number",     value: cmsForm.whatsapp },
        { key: "site_title",          value: cmsForm.siteTitle },
        { key: "site_description",    value: cmsForm.siteDescription },
      ];
      await Promise.all(settings.map(s =>
        fetch(apiUrl("/api/admin/upsert-setting"), { method: "POST", headers: authHeaders(token), body: JSON.stringify(s) })
      ));
      setNotice("CMS settings saved successfully.");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save CMS settings"); }
    finally { setCmsLoading(false); }
  }

  // ── Email Logs ───────────────────────────────────────────────────────────────
  async function loadEmailLogs() {
    if (!token) return;
    try {
      const r = await fetch(apiUrl("/api/admin/email-logs?limit=50"), { headers: noStoreHeaders(token) });
      const d = await r.json();
      if (d.ok) setEmailLogs(d.rows || []);
    } catch { }
  }

  function duplicateBlog(b: BlogPost) {
    setBlogForm({ ...b, title: b.title + " (Copy)", slug: b.slug + "-copy-" + Date.now().toString(36).slice(-4), status: "draft", publishedAt: new Date().toISOString().slice(0, 10) });
    setBlogTagsInput((b.tags || []).join(", "));
    setEditingBlog(null);
    setNotice("Duplicated. Edit and save as a new post.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Templates ────────────────────────────────────────────────────────────────
  async function saveTemplate() {
    setError("");
    setNotice("");

    if (!templateForm.name?.trim() || !templateForm.subject?.trim() || !templateForm.body?.trim()) {
      setError("Template name, subject and body are required.");
      return;
    }

    try {
      const method = editingTemplate !== null ? "PATCH" : "POST";
      const tUrl = editingTemplate !== null ? `/api/admin/templates/${editingTemplate}` : "/api/admin/templates";
      const response = await fetch(apiUrl(tUrl), {
        method,
        headers: authHeaders(token),
        body: JSON.stringify({ ...templateForm, category: "general" }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) throw new Error(data.error || "Could not save template");

      await loadTemplatesFromApi();
      setEditingTemplate(null);
      setTemplateForm({ name: "", subject: "", body: "" });
      setNotice(editingTemplate !== null ? "Template updated." : "Template saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save template");
    }
  }

  function editTemplate(t: typeof defaultTemplates[0]) {
    setTemplateForm({ name: t.name, subject: t.subject, body: t.body });
    setEditingTemplate(t.id);
  }

  async function deleteTemplate(id: number) {
    if (!window.confirm("Delete this email template?")) return;
    setError("");
    setNotice("");
    try {
      const response = await fetch(apiUrl(`/api/admin/templates/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) throw new Error(data.error || "Could not delete template");
      await loadTemplatesFromApi();
      setNotice("Template deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete template");
    }
  }

  const selectedLeads = useMemo(() => leads.filter((l) => selected.includes(l.id)), [leads, selected]);
  const pagedLeads = useMemo(() => leads.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [leads, page, PAGE_SIZE]);
  const searchResults = useMemo(() => {
    if (!globalSearchQuery.trim()) return [];
    const q = globalSearchQuery.toLowerCase();
    const results: { type: string; label: string; sub: string; tab: AdminTab }[] = [];
    leads.filter(l => l.name?.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q) || l.phone?.includes(q)).slice(0, 5).forEach(l => results.push({ type: "Lead", label: l.name || l.email || "Unknown", sub: l.form_type, tab: "leads" }));
    blogs.filter(b => b.title.toLowerCase().includes(q) || b.category.toLowerCase().includes(q)).slice(0, 5).forEach(b => results.push({ type: "Blog", label: b.title, sub: b.category, tab: "blogs" }));
    return results.slice(0, 10);
  }, [globalSearchQuery, leads, blogs]);
  const canManage = admin?.role === "super_admin" || admin?.role === "admin" || admin?.permissions?.all || admin?.permissions?.manage_leads;
  const canSettings = admin?.role === "super_admin" || admin?.role === "admin" || admin?.permissions?.all || admin?.permissions?.manage_settings;

  async function login(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const response = await fetch(apiUrl("/api/admin/login"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("athoo_admin_token", data.token);
      localStorage.setItem("athoo_admin_user", JSON.stringify(data.admin));
      setToken(data.token); setAdmin(data.admin); setPassword("");
    } catch (err) { setError(err instanceof Error ? err.message : "Login failed"); }
    finally { setLoading(false); }
  }

  function queryString(overrideFormType?: string) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    if (overrideFormType !== undefined) { if (overrideFormType) params.set("formType", overrideFormType); else params.delete("formType"); }
    return params.toString();
  }

  async function loadLeads(overrideFormType?: string) {
    if (!token) return; setLoading(true); setError("");
    try {
      const response = await fetch(apiUrl(`/api/admin/leads?${queryString(overrideFormType)}`), { headers: noStoreHeaders(token) });
      const data = await response.json();
      if (response.status === 401) { logout(); throw new Error("Session expired. Please login again."); }
      if (!response.ok) throw new Error(data.error || "Could not load leads");
      setLeads(data.rows || []); setStats(data.stats || stats); setAdmins(data.admins || []);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load leads"); }
    finally { setLoading(false); }
  }

  async function loadSettings() {
    if (!token) return;
    try {
      const response = await fetch(apiUrl("/api/admin/settings"), { headers: noStoreHeaders(token) });
      const data = await response.json(); if (!response.ok) return;
      setSettings(data.settings || {});
      setMaintenance({
        enabled: Boolean(data.settings?.maintenance_mode?.enabled),
        message: data.settings?.maintenance_mode?.message || "Athoo website is under maintenance. Please check back soon.",
        supportEmail: data.settings?.support_email || "official@athoo.pk",
        supportPhone: data.settings?.support_phone || "+92 339 0051068",
      });
    } catch { }
  }

  async function loadAdmins() {
    if (!token) return;
    try { const r = await fetch(apiUrl("/api/admin/admins"), { headers: noStoreHeaders(token) }); const d = await r.json(); if (r.ok) setAdmins(d.rows || []); } catch { }
  }
  async function loadActivity() {
    if (!token) return;
    try { const r = await fetch(apiUrl("/api/admin/activity"), { headers: noStoreHeaders(token) }); const d = await r.json(); if (r.ok) setActivity(d.rows || []); } catch { }
  }

  function logout() { localStorage.removeItem("athoo_admin_token"); localStorage.removeItem("athoo_admin_user"); setToken(""); setAdmin(null); setLeads([]); }

  function exportCsv() {
    const params = new URLSearchParams(queryString());
    fetch(apiUrl(`/api/admin/export?${params.toString()}`), { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob()).then((blob) => { const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "athoo-leads.csv"; link.click(); });
  }

  async function updateLeads(patch: Record<string, unknown>, ids = selected) {
    if (!ids.length) return setError("Select at least one lead first.");
    setLoading(true); setError(""); setNotice("");
    try {
      const r = await fetch(apiUrl("/api/admin/lead-update"), { method: "POST", headers: authHeaders(token), body: JSON.stringify({ ids, ...patch }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Update failed");
      setNotice("Lead updated."); setSelected([]); await loadLeads(FORM_TYPE_MAP[activeTab]);
    } catch (err) { setError(err instanceof Error ? err.message : "Update failed"); }
    finally { setLoading(false); }
  }

  async function sendBulkEmail() {
    const ids = selected.length ? selected : selectedLeads.map((l) => l.id);
    if (!ids.length) return setError("Select leads first.");
    setLoading(true); setEmailProgress("Preparing email queue..."); setError(""); setNotice("");
    try {
      setEmailProgress(`Sending to ${ids.length} selected lead(s)...`);
      const r = await fetch(apiUrl("/api/admin/bulk-email"), { method: "POST", headers: authHeaders(token), body: JSON.stringify({ ids, ...emailDraft }) });
      const d = await r.json();
      if (!r.ok || d.ok === false) throw new Error(d.error || d.note || "Email failed");
      const msg = d.note || `Done. Sent: ${d.sent || 0}, failed: ${d.failed || 0}, skipped: ${d.skipped || 0}`;
      setEmailProgress(msg);
      setNotice(msg);
      await loadEmailLogs();
      await loadLeads(FORM_TYPE_MAP[activeTab]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Email failed";
      setEmailProgress(`Failed: ${msg}`);
      setError(msg);
    }
    finally { setLoading(false); }
  }

  async function saveAdminUser(e: React.FormEvent) {
    e.preventDefault(); setError(""); setNotice("");
    try {
      const r = await fetch(apiUrl("/api/admin/admins"), { method: "POST", headers: authHeaders(token), body: JSON.stringify(adminForm) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Could not save admin");
      setNotice("Admin user saved."); setAdminForm({ name: "", email: "", role: "manager", password: "", is_active: true }); await loadAdmins();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save admin"); }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault(); setError(""); setNotice(""); setSettingsSaving(true);
    try {
      const r = await fetch(apiUrl("/api/admin/settings"), { method: "POST", headers: authHeaders(token), body: JSON.stringify({ maintenanceEnabled: maintenance.enabled, maintenanceMessage: maintenance.message, supportEmail: maintenance.supportEmail, supportPhone: maintenance.supportPhone }) });
      const d = await r.json(); if (!r.ok || d.ok === false) throw new Error(d.error || "Could not save settings");
      setNotice(maintenance.enabled ? "Maintenance mode is ON and saved." : "Maintenance mode is OFF and saved.");
      await loadSettings();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save settings"); }
    finally { setSettingsSaving(false); }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => { if (token) { loadLeads(); loadSettings(); } }, [token]);
  useEffect(() => {
    if (!token) return;
    const ft = FORM_TYPE_MAP[activeTab];
    if (activeTab === "leads" || ft) loadLeads(ft);
    if (activeTab === "admins") loadAdmins();
    if (activeTab === "activity") loadActivity();
    if (activeTab === "blogs") loadBlogs();
    if (activeTab === "seo" || activeTab === "social" || activeTab === "faq") loadExtendedSettings();
    if (activeTab === "media") loadMediaFromApi();
    if (activeTab === "templates") loadTemplatesFromApi();
    if (activeTab === "blog-categories") loadBlogCatsFromApi();
    if (activeTab === "database") loadDbStats();
    if (activeTab === "services") loadServices();
    if (activeTab === "cms") loadCmsSettings();
    if (activeTab === "email") loadEmailLogs();
  }, [activeTab]);

  function switchTab(tab: AdminTab) { setActiveTab(tab); setSidebarOpen(false); setError(""); setNotice(""); }

  // ── Login screen ────────────────────────────────────────────────────────────
  if (!token) return (
    <><Helmet><title>Athoo Admin Login</title></Helmet>
      <main className="min-h-screen bg-[#081120] px-4 py-10 text-white sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
          <div className="hidden lg:block">
            <img src="/athoo-logo.webp" alt="Athoo" width={80} height={80} decoding="async" className="mb-8 h-20 w-20 rounded-3xl bg-white p-2 shadow-2xl" />
            <h1 className="text-5xl font-black leading-tight">Athoo Professional Admin</h1>
            <p className="mt-5 max-w-xl text-lg text-gray-300">Manage leads, providers, waitlist, blog content, SEO, email communications and website controls from one secure dashboard.</p>
          </div>
          <div className="rounded-[2rem] bg-white p-6 text-gray-900 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600"><Lock /></div><div><h1 className="text-2xl font-black">Athoo Admin</h1><p className="text-sm text-gray-500">Secure dashboard login</p></div></div>
            <form onSubmit={login} className="space-y-4">
              <Input type="email" placeholder="Admin email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} className="min-h-12" />
              <Input type="password" placeholder="Admin password" value={password} onChange={(e) => setPassword(e.target.value)} className="min-h-12" />
              {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
              <Button className="min-h-12 w-full rounded-xl bg-[#0057FF]" disabled={loading}>{loading ? "Checking..." : "Login"}</Button>
            </form>
          </div>
        </div>
      </main>
    </>
  );

  // ── Main admin layout ───────────────────────────────────────────────────────
  return (
    <><Helmet><title>Athoo Admin — {TAB_LABELS[activeTab]}</title></Helmet>
      <div className="flex h-screen overflow-hidden bg-[#f5f7fb] text-gray-900">

        {/* Mobile sidebar overlay */}
        {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-[#081120] text-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          {/* Logo */}
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div className="flex items-center gap-3">
              <img src="/athoo-logo.webp" alt="Athoo" width={48} height={48} decoding="async" className="h-10 w-10 rounded-xl bg-white p-1" />
              <div><div className="text-lg font-black">Athoo</div><div className="text-xs uppercase tracking-widest text-blue-300">Admin Panel</div></div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 hover:bg-white/10 lg:hidden"><X className="h-5 w-5" /></button>
          </div>

          {/* Admin info */}
          <div className="mx-3 mt-3 rounded-2xl bg-white/10 p-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0057FF] text-sm font-black">{(admin?.name || "A")[0].toUpperCase()}</div>
              <div className="min-w-0"><div className="truncate font-bold">{admin?.name || "Admin"}</div><div className="truncate text-xs text-gray-400">{admin?.email}</div></div>
            </div>
            <div className="mt-2 inline-flex rounded-full bg-orange-500/80 px-3 py-0.5 text-xs font-bold">{prettyRole(admin?.role || "admin")}</div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-3 space-y-1">
            {SIDEBAR_SECTIONS.map((section) => (
              <div key={section.label} className="px-3">
                <div className="mb-1 mt-3 px-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">{section.label}</div>
                {section.items.map(({ tab, icon: Icon, label }) => (
                  <button key={tab} onClick={() => switchTab(tab)} className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-left ${activeTab === tab ? "bg-white text-[#0057FF] font-bold shadow-sm" : "text-gray-300 hover:bg-white/10 hover:text-white"}`}>
                    <Icon className="h-4 w-4 shrink-0" />{label}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          {/* Logout */}
          <div className="border-t border-white/10 p-3">
            <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20 hover:text-red-100">
              <LogOut className="h-4 w-4" />Logout
            </button>
          </div>
        </aside>

        {/* Main area */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Top header */}
          <header className="flex shrink-0 items-center gap-3 border-b bg-white px-4 py-3 shadow-sm">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-xl p-2 hover:bg-gray-100 lg:hidden"><Menu className="h-5 w-5" /></button>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-gray-400">Athoo Admin</div>
              <div className="truncate text-sm font-bold text-gray-800">{TAB_LABELS[activeTab]}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSearchOpen(true)} className="hidden items-center gap-2 rounded-xl border bg-gray-50 px-3 py-1.5 text-sm text-gray-400 hover:border-blue-200 hover:bg-blue-50 sm:flex"><Search className="h-3.5 w-3.5" /><span>Search</span><kbd className="ml-1 rounded bg-gray-200 px-1.5 py-0.5 text-xs font-mono text-gray-500">⌘K</kbd></button>
              <Button size="sm" variant="secondary" onClick={() => loadLeads(FORM_TYPE_MAP[activeTab])} className="hidden sm:flex"><RefreshCw className="mr-1.5 h-3.5 w-3.5" />Refresh</Button>
              <div className="hidden sm:block text-sm font-semibold text-gray-600">{admin?.name}</div>
              <Button size="sm" variant="secondary" title="Logout" onClick={logout}><LogOut className="h-4 w-4" /></Button>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {error && <div className="mb-4 flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600"><AlertTriangle className="h-4 w-4 shrink-0" />{error}</div>}
            {notice && <div className="mb-4 flex items-center gap-2 rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-700"><CheckCircle2 className="h-4 w-4 shrink-0" />{notice}</div>}

            {/* ── Dashboard ──────────────────────────────────────────────────────── */}
            {activeTab === "dashboard" && <>
              <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                {[["Total Leads", stats.total, Users, "#0057FF"], ["Today", stats.today, Bell, "#FF8A00"], ["New", stats.new_leads, AlertTriangle, "#EF4444"], ["Providers", stats.providers, ShieldCheck, "#8A2BE2"], ["Waitlist", stats.waitlist, CheckCircle2, "#10B981"], ["Contact", stats.contacts, Mail, "#06B6D4"]].map(([label, value, Icon, color]: any) =>
                  <div key={label} className="rounded-3xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: color + "20" }}><Icon className="h-5 w-5" style={{ color }} /></div>
                    <div className="text-3xl font-black">{value || 0}</div>
                    <div className="text-sm font-medium text-gray-500">{label}</div>
                  </div>
                )}
              </div>
              <div className="mb-5 grid gap-4 lg:grid-cols-3">
                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <h3 className="mb-4 font-black">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button className="w-full justify-start bg-[#0057FF]" onClick={() => switchTab("blogs")}><BookOpen className="mr-2 h-4 w-4" />Write a Blog Post</Button>
                    <Button className="w-full justify-start" variant="secondary" onClick={() => switchTab("email")}><Mail className="mr-2 h-4 w-4" />Send Bulk Email</Button>
                    <Button className="w-full justify-start" variant="secondary" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />Export Leads CSV</Button>
                    <Button className="w-full justify-start" variant="secondary" onClick={() => switchTab("waitlist")}><Bell className="mr-2 h-4 w-4" />View Waitlist</Button>
                  </div>
                </div>
                <div className="col-span-2 overflow-hidden rounded-3xl bg-white shadow-sm">
                  <div className="border-b p-5"><h3 className="font-black">Recent Leads</h3></div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-sm">
                      <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500"><tr><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Type</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Date</th></tr></thead>
                      <tbody>{leads.slice(0, 8).map(l => <tr key={l.id} className="border-t hover:bg-gray-50"><td className="px-4 py-3 font-medium">{l.name || "—"}</td><td className="px-4 py-3 text-gray-500">{l.form_type}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${l.status === "new" ? "bg-blue-50 text-blue-700" : l.status === "approved" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>{l.status}</span></td><td className="px-4 py-3 text-gray-500">{new Date(l.created_at).toLocaleDateString()}</td></tr>)}{!leads.length && <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">No leads yet.</td></tr>}</tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>}

            {/* ── Leads table (shared by leads / waitlist / providers / contacts / support) ── */}
            {(activeTab === "leads" || activeTab === "waitlist" || activeTab === "providers" || activeTab === "contacts" || activeTab === "support") && <>
              {activeTab === "leads" && <div className="mb-5 rounded-[1.75rem] bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2 font-black"><SlidersHorizontal className="h-5 w-5 text-[#0057FF]" /> Filters</div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="relative"><Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" /><Input className="min-h-12 pl-10" placeholder="Search name, email, phone..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></div>
                  <select className="min-h-12 rounded-xl border px-3" value={filters.formType} onChange={(e) => setFilters({ ...filters, formType: e.target.value })}><option value="">All forms</option><option>Contact Form</option><option>Waitlist Signup</option><option>Provider Waitlist</option></select>
                  <select className="min-h-12 rounded-xl border px-3" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">All status</option>{statuses.map(s => <option key={s}>{s}</option>)}</select>
                  <select className="min-h-12 rounded-xl border px-3" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}><option value="">All priority</option>{priorities.map(s => <option key={s}>{s}</option>)}</select>
                  <Input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} />
                  <Input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} />
                  <select className="min-h-12 rounded-xl border px-3" value={filters.assignedTo} onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}><option value="">All assigned</option>{admins.map(a => <option key={a.email} value={a.email}>{a.name}</option>)}</select>
                  <Button className="min-h-12 bg-[#FF8A00]" onClick={() => loadLeads()} disabled={loading}>{loading ? "Loading..." : "Apply Filters"}</Button>
                </div>
              </div>}

              {activeTab !== "leads" && <div className="mb-4 flex items-center gap-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                <ShieldCheck className="h-4 w-4" />Showing {TAB_LABELS[activeTab]} only — {leads.length} record{leads.length !== 1 ? "s" : ""}
                <Button size="sm" variant="secondary" className="ml-auto" onClick={() => loadLeads(FORM_TYPE_MAP[activeTab])} disabled={loading}><RefreshCw className="h-3.5 w-3.5" /></Button>
              </div>}

              <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                {[["Total", stats.total, Users], ["Today", stats.today, Bell], ["New", stats.new_leads, AlertTriangle], ["Providers", stats.providers, ShieldCheck], ["Waitlist", stats.waitlist, CheckCircle2], ["Contact", stats.contacts, Mail]].map(([label, value, Icon]: any) =>
                  <div key={label} className="rounded-3xl bg-white p-4 shadow-sm"><Icon className="mb-3 h-5 w-5 text-[#0057FF]" /><div className="text-2xl font-black">{value || 0}</div><div className="text-sm text-gray-500">{label}</div></div>
                )}
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                <Button className="bg-[#0057FF]" onClick={() => loadLeads(FORM_TYPE_MAP[activeTab])} disabled={loading}><RefreshCw className="mr-2 h-4 w-4" />{loading ? "Loading..." : "Refresh"}</Button>
                <Button variant="secondary" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
                {selected.length > 0 && <><Button size="sm" variant="secondary" onClick={() => updateLeads({ status: "contacted" })}>Mark Contacted</Button><Button size="sm" variant="secondary" onClick={() => updateLeads({ status: "approved" })}>Approve</Button><Button size="sm" variant="secondary" onClick={() => updateLeads({ priority: "urgent" })}>Mark Urgent</Button><Button size="sm" variant="secondary" onClick={() => switchTab("email")}>Email Selected ({selected.length})</Button></>}
              </div>

              <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
                      <tr><th className="p-4"><input type="checkbox" onChange={(e) => setSelected(e.target.checked ? leads.map(l => l.id) : [])} checked={leads.length > 0 && selected.length === leads.length} /></th><th className="p-4">Date</th><th className="p-4">Form</th><th className="p-4">Name</th><th className="p-4">Contact</th><th className="p-4">Service / City</th><th className="p-4">Message</th><th className="p-4">Status</th><th className="p-4">Priority</th></tr>
                    </thead>
                    <tbody>
                      {pagedLeads.map(lead => <tr key={lead.id} className="border-t align-top hover:bg-blue-50/30">
                        <td className="p-4"><input type="checkbox" checked={selected.includes(lead.id)} onChange={(e) => setSelected(e.target.checked ? [...selected, lead.id] : selected.filter(id => id !== lead.id))} /></td>
                        <td className="p-4 text-xs text-gray-500">{new Date(lead.created_at).toLocaleString()}</td>
                        <td className="p-4 font-semibold">{lead.form_type}</td>
                        <td className="p-4">{lead.name || "—"}</td>
                        <td className="p-4 text-xs"><div>{lead.email || "—"}</div><div className="text-gray-400">{lead.phone || ""}</div></td>
                        <td className="p-4 text-xs"><div>{lead.service || "—"}</div><div className="text-gray-400">{lead.city || ""}</div></td>
                        <td className="max-w-xs p-4 text-xs"><div className="line-clamp-3">{lead.message || lead.subject || lead.experience || "—"}</div></td>
                        <td className="p-4"><select className="rounded-xl border px-2 py-1 text-xs" value={lead.status} disabled={!canManage} onChange={(e) => updateLeads({ status: e.target.value }, [lead.id])}>{statuses.map(s => <option key={s}>{s}</option>)}</select></td>
                        <td className="p-4"><select className="rounded-xl border px-2 py-1 text-xs" value={lead.priority || "normal"} disabled={!canManage} onChange={(e) => updateLeads({ priority: e.target.value }, [lead.id])}>{priorities.map(s => <option key={s}>{s}</option>)}</select></td>
                      </tr>)}
                      {!leads.length && <tr><td colSpan={9} className="p-8 text-center text-gray-400">No records found.</td></tr>}
                    </tbody>
                  </table>
                </div>
                {leads.length > PAGE_SIZE && (
                  <div className="mt-4 flex items-center justify-between px-1">
                    <span className="text-sm text-gray-500">Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, leads.length)} of {leads.length}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</Button>
                      <Button size="sm" variant="secondary" disabled={(page + 1) * PAGE_SIZE >= leads.length} onClick={() => setPage(p => p + 1)}>Next →</Button>
                    </div>
                  </div>
                )}
              </div>
            </>}

            {/* ── Bulk Email ──────────────────────────────────────────────────────── */}
            {activeTab === "email" && <div className="space-y-5">
              <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
                <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                  <h2 className="mb-2 text-2xl font-black">Bulk Email</h2>
                  <p className="mb-5 text-sm text-gray-500">Select leads from CRM first, then compose and send. Delivered via SMTP when configured, otherwise logged only.</p>
                  <Input className="mb-3 min-h-12" value={emailDraft.subject} onChange={(e) => setEmailDraft({ ...emailDraft, subject: e.target.value })} placeholder="Subject" />
                  <textarea className="min-h-[260px] w-full rounded-xl border p-4 font-mono text-sm" value={emailDraft.message} onChange={(e) => setEmailDraft({ ...emailDraft, message: e.target.value })} />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button className="bg-[#0057FF]" onClick={sendBulkEmail} disabled={loading}><Send className="mr-2 h-4 w-4" />{loading ? "Sending..." : `Send to Selected (${selected.length})`}</Button>
                    <Button variant="secondary" onClick={() => switchTab("leads")}>Select Leads</Button>
                  </div>
                  {emailProgress && <div className="mt-3 rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-700">{emailProgress}</div>}
                </div>
                <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                  <h3 className="mb-3 font-black">Selected Recipients</h3>
                  {selectedLeads.length ? selectedLeads.map(l => <div key={l.id} className="mb-2 rounded-2xl bg-gray-50 p-3 text-sm"><b>{l.name || "No name"}</b><br /><span className="text-gray-500">{l.email || "No email"}</span></div>) : <p className="text-sm text-gray-500">No leads selected. Go to All Leads tab and check the rows you want.</p>}
                </div>
              </div>
              <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-black">Email Send Log ({emailLogs.length})</h3>
                  <Button size="sm" variant="secondary" onClick={loadEmailLogs}><RefreshCw className="h-4 w-4" /></Button>
                </div>
                {emailLogs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b text-left text-xs text-gray-400"><th className="pb-2 pr-3">Recipient</th><th className="pb-2 pr-3">Subject</th><th className="pb-2 pr-3">Status</th><th className="pb-2 pr-3">Sent by</th><th className="pb-2">Date</th></tr></thead>
                      <tbody>{emailLogs.map(l => <tr key={l.id} className="border-b last:border-0"><td className="py-2 pr-3 text-xs">{l.recipient}</td><td className="py-2 pr-3 text-xs">{l.subject}</td><td className="py-2 pr-3"><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${l.status === "sent" ? "bg-green-50 text-green-700" : l.status === "failed" ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-500"}`}>{l.status}</span></td><td className="py-2 pr-3 text-xs text-gray-500">{l.sent_by || "—"}</td><td className="py-2 text-xs text-gray-400">{new Date(l.created_at).toLocaleDateString()}</td></tr>)}</tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500"><Send className="mx-auto mb-2 h-7 w-7 text-gray-300" /><p>No emails sent yet. Email history appears here after sending.</p></div>
                )}
              </div>
            </div>}

            {/* ── Blog CMS ──────────────────────────────────────────────────────── */}
            {activeTab === "blogs" && <div className="grid gap-5 xl:grid-cols-[440px_1fr]">
              <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-xl font-black"><BookOpen className="mr-2 inline h-5 w-5 text-[#0057FF]" />{editingBlog !== null ? "Edit Post" : "New Blog Post"}</h2>
                <Input className="mb-2 min-h-11" placeholder="Title *" value={blogForm.title || ""} onChange={(e) => { const t = e.target.value; setBlogForm({ ...blogForm, title: t, slug: blogForm.slug || t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") }); }} />
                <Input className="mb-2 min-h-11" placeholder="Slug (url-friendly) *" value={blogForm.slug || ""} onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} />
                <div className="mb-2 grid grid-cols-2 gap-2">
                  <select className="min-h-11 rounded-xl border px-3 text-sm" value={blogForm.category || "Insights"} onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}>{BLOG_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
                  <Input placeholder="Author" value={blogForm.author || ""} onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })} />
                </div>
                <div className="mb-2 grid grid-cols-2 gap-2">
                  <Input placeholder="Cover image URL" value={blogForm.coverImage || ""} onChange={(e) => setBlogForm({ ...blogForm, coverImage: e.target.value })} />
                  <Input placeholder="Read time (e.g. 5 min)" value={blogForm.readTime || ""} onChange={(e) => setBlogForm({ ...blogForm, readTime: e.target.value })} />
                </div>
                <div className="mb-2 grid grid-cols-2 gap-2">
                  <Input type="date" value={blogForm.publishedAt || ""} onChange={(e) => setBlogForm({ ...blogForm, publishedAt: e.target.value })} />
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-semibold"><input type="checkbox" checked={!!blogForm.featured} onChange={(e) => setBlogForm({ ...blogForm, featured: e.target.checked })} /> Featured</label>
                </div>
                <textarea className="mb-2 min-h-[70px] w-full rounded-xl border p-3 text-sm" placeholder="Excerpt (short summary)" value={blogForm.excerpt || ""} onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })} />
                <Input className="mb-2 min-h-11" placeholder="Tags (comma-separated: islamabad, plumber, tips)" value={blogTagsInput} onChange={(e) => { setBlogTagsInput(e.target.value); setBlogForm(f => ({ ...f, tags: e.target.value.split(",").map((t: string) => t.trim()).filter(Boolean) })); }} />
                <div className="mb-3">
                  <BlogEditor key={editingBlog ?? "new"} value={blogForm.content || ""} onChange={(c) => setBlogForm(f => ({ ...f, content: c }))} />
                </div>
                <details className="mb-3 rounded-xl border p-3">
                  <summary className="cursor-pointer text-xs font-bold text-gray-500">SEO Fields (optional)</summary>
                  <div className="mt-2 space-y-2">
                    <Input placeholder="Meta title (leave blank to use post title)" value={blogForm.metaTitle || ""} onChange={(e) => setBlogForm({ ...blogForm, metaTitle: e.target.value })} />
                    <textarea className="min-h-[60px] w-full rounded-xl border p-2 text-xs" placeholder="Meta description (leave blank to use excerpt)" value={blogForm.metaDescription || ""} onChange={(e) => setBlogForm({ ...blogForm, metaDescription: e.target.value })} />
                  </div>
                </details>
                <div className="flex flex-wrap items-center gap-2">
                  <select className="rounded-xl border px-3 py-2 text-sm" value={blogForm.status || "draft"} onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value as "draft" | "published" })}><option value="draft">Draft</option><option value="published">Published</option></select>
                  <Button className="flex-1 bg-[#0057FF]" onClick={saveBlog} disabled={blogLoading}><Pencil className="mr-2 h-4 w-4" />{blogLoading ? "Saving..." : editingBlog !== null ? "Update Post" : "Create Post"}</Button>
                  {editingBlog !== null && <Button variant="secondary" title="Duplicate this post" onClick={() => { const b = blogs.find(b => b.id === editingBlog); if (b) duplicateBlog(b); }}><Copy className="mr-1.5 h-3.5 w-3.5" />Dup</Button>}
                  {editingBlog !== null && <Button variant="secondary" onClick={resetBlogForm}>Cancel</Button>}
                </div>
              </div>
              <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <h2 className="flex-1 text-xl font-black">Blog Posts ({blogs.length})</h2>
                  <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="min-h-9 w-40 pl-9 text-sm" placeholder="Search..." value={blogSearch} onChange={(e) => setBlogSearch(e.target.value)} /></div>
                  <select className="rounded-xl border px-3 py-2 text-sm" value={blogStatusFilter} onChange={(e) => setBlogStatusFilter(e.target.value)}><option value="">All</option><option value="published">Published</option><option value="draft">Draft</option></select>
                  <Button size="sm" variant="secondary" onClick={loadBlogs} disabled={blogLoading}><RefreshCw className="h-4 w-4" /></Button>
                </div>
                {blogLoading && <p className="mb-3 text-sm text-gray-400">Loading posts...</p>}
                <div className="space-y-3">
                  {blogs.filter(b => (!blogSearch || b.title.toLowerCase().includes(blogSearch.toLowerCase())) && (!blogStatusFilter || b.status === blogStatusFilter)).map((b) =>
                    <div key={b.id} className="rounded-2xl border p-4 transition hover:border-blue-200 hover:bg-blue-50/20">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold leading-snug">{b.title}</div>
                          <div className="mt-1 text-xs text-gray-500">{b.slug} • {b.category} • {b.author}</div>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${b.status === "published" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>{b.status === "published" ? <Globe className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}{b.status}</span>
                            {b.featured && <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-600">Featured</span>}
                            {b.readTime && <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-600">{b.readTime}</span>}
                            {(b.tags?.length ?? 0) > 0 && b.tags!.slice(0,3).map(t => <span key={t} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">#{t}</span>)}
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button size="sm" variant="secondary" title="Duplicate" onClick={() => duplicateBlog(b)}><Copy className="h-3.5 w-3.5" /></Button>
                          <Button size="sm" variant="secondary" onClick={() => editBlog(b)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button size="sm" variant="secondary" onClick={() => deleteBlog(b.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    </div>
                  )}
                  {!blogs.length && !blogLoading && <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500"><BookOpen className="mx-auto mb-3 h-8 w-8 text-gray-300" /><p className="mb-1 font-semibold">No blog posts yet</p><p>Create your first post using the form on the left.</p></div>}
                </div>
              </div>
            </div>}

            {/* ── Media Library ───────────────────────────────────────────────────── */}
            {activeTab === "media" && <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
              <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-xl font-black"><ImageIcon className="mr-2 inline h-5 w-5 text-[#0057FF]" />Add Media</h2>
                <Input className="mb-2 min-h-11" placeholder="Image / video URL *" value={mediaForm.url} onChange={(e) => setMediaForm({ ...mediaForm, url: e.target.value })} />
                <Input className="mb-2 min-h-11" placeholder="Alt text (for accessibility)" value={mediaForm.alt} onChange={(e) => setMediaForm({ ...mediaForm, alt: e.target.value })} />
                <Input className="mb-2 min-h-11" placeholder="Caption (optional)" value={mediaForm.caption} onChange={(e) => setMediaForm({ ...mediaForm, caption: e.target.value })} />
                <select className="mb-3 min-h-11 w-full rounded-xl border px-3 text-sm" value={mediaForm.type} onChange={(e) => setMediaForm({ ...mediaForm, type: e.target.value })}>
                  <option value="image">Image</option><option value="video">Video</option><option value="document">Document</option>
                </select>
                {mediaForm.url && <div className="mb-3 overflow-hidden rounded-xl border"><img src={mediaForm.url} alt={mediaForm.alt} className="h-36 w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} /></div>}
                <Button className="w-full bg-[#0057FF]" onClick={saveMediaItem} disabled={extLoading}>Add to Library</Button>
              </div>
              <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-xl font-black">Media Library ({mediaItems.length})</h2>
                {extLoading && <p className="text-sm text-gray-400">Loading...</p>}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {mediaItems.map(m => <div key={m.id} className="group relative overflow-hidden rounded-2xl border">
                    <img src={m.url} alt={m.alt} className="h-36 w-full object-cover" onError={(e) => (e.currentTarget.src = "/favicon.ico")} />
                    <div className="p-3"><div className="truncate text-xs font-semibold">{m.alt || "No alt text"}</div><div className="truncate text-xs text-gray-400">{m.caption || m.url.split("/").pop()}</div></div>
                    <button onClick={() => { navigator.clipboard?.writeText(m.url); setNotice("URL copied!"); }} className="absolute right-2 top-2 rounded-lg bg-white/90 p-1.5 text-xs shadow hover:bg-white">Copy URL</button>
                    <button onClick={() => deleteMediaItem(m.id)} className="absolute left-2 top-2 rounded-lg bg-red-50/90 p-1.5 text-red-500 shadow hover:bg-red-100"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>)}
                  {!mediaItems.length && !extLoading && <div className="col-span-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500"><ImageIcon className="mx-auto mb-3 h-8 w-8 text-gray-300" /><p>No media yet. Add your first image above.</p></div>}
                </div>
              </div>
            </div>}

            {/* ── FAQ Manager ─────────────────────────────────────────────────────── */}
            {activeTab === "faq" && <div className="grid gap-5 lg:grid-cols-[400px_1fr]">
              <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-xl font-black"><HelpCircle className="mr-2 inline h-5 w-5 text-[#0057FF]" />{editingFaqId !== null ? "Edit FAQ" : "Add FAQ"}</h2>
                <select className="mb-2 min-h-11 w-full rounded-xl border px-3 text-sm" value={faqForm.category} onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}>{FAQ_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
                <textarea className="mb-2 min-h-[80px] w-full rounded-xl border p-3 text-sm" placeholder="Question *" value={faqForm.q} onChange={(e) => setFaqForm({ ...faqForm, q: e.target.value })} />
                <textarea className="mb-3 min-h-[120px] w-full rounded-xl border p-3 text-sm" placeholder="Answer *" value={faqForm.a} onChange={(e) => setFaqForm({ ...faqForm, a: e.target.value })} />
                <div className="flex gap-2">
                  <Button className="flex-1 bg-[#0057FF]" onClick={saveFaqItem} disabled={extLoading}>{editingFaqId !== null ? "Update FAQ" : "Add FAQ"}</Button>
                  {editingFaqId !== null && <Button variant="secondary" onClick={() => { setEditingFaqId(null); setFaqForm({ q: "", a: "", category: "General" }); }}>Cancel</Button>}
                </div>
              </div>
              <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-xl font-black">FAQ Items ({faqItems.length})</h2>
                {extLoading && <p className="text-sm text-gray-400">Loading...</p>}
                <div className="space-y-3">
                  {faqItems.map(f => <div key={f.id} className="rounded-2xl border p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1"><div className="font-bold">{f.q}</div><div className="mt-1 line-clamp-2 text-sm text-gray-500">{f.a}</div><div className="mt-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600 inline-block">{f.category}</div></div>
                      <div className="flex shrink-0 gap-1">
                        <Button size="sm" variant="secondary" onClick={() => { setFaqForm({ q: f.q, a: f.a, category: f.category }); setEditingFaqId(f.id); }}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="secondary" onClick={() => deleteFaqItem(f.id)} className="text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </div>)}
                  {!faqItems.length && !extLoading && <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500"><HelpCircle className="mx-auto mb-3 h-8 w-8 text-gray-300" /><p>No FAQ items yet. Add your first question above.</p></div>}
                </div>
              </div>
            </div>}

            {/* ── SEO Settings ─────────────────────────────────────────────────────── */}
            {activeTab === "seo" && <form onSubmit={saveSeoSettings} className="mx-auto max-w-2xl rounded-[1.75rem] bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-2xl font-black"><Globe className="mr-2 inline h-6 w-6 text-[#0057FF]" />SEO Settings</h2>
              <div className="space-y-4">
                <div><label className="mb-1 block text-sm font-semibold">Site Title</label><Input value={seoForm.siteTitle} onChange={(e) => setSeoForm({ ...seoForm, siteTitle: e.target.value })} /></div>
                <div><label className="mb-1 block text-sm font-semibold">Site Description</label><textarea className="min-h-[80px] w-full rounded-xl border p-3 text-sm" value={seoForm.siteDescription} onChange={(e) => setSeoForm({ ...seoForm, siteDescription: e.target.value })} /></div>
                <div><label className="mb-1 block text-sm font-semibold">OG / Social Share Image URL</label><Input value={seoForm.ogImage} onChange={(e) => setSeoForm({ ...seoForm, ogImage: e.target.value })} placeholder="https://www.athoo.pk/opengraph.jpg" /></div>
                <div><label className="mb-1 block text-sm font-semibold">Google Search Console Verification Code</label><Input value={seoForm.googleVerification} onChange={(e) => setSeoForm({ ...seoForm, googleVerification: e.target.value })} placeholder="google-site-verification=..." /></div>
                <div><label className="mb-1 block text-sm font-semibold">Bing Webmaster Verification Code</label><Input value={seoForm.bingVerification} onChange={(e) => setSeoForm({ ...seoForm, bingVerification: e.target.value })} /></div>
                <Button type="submit" className="bg-[#0057FF]" disabled={extLoading}>Save SEO Settings</Button>
              </div>
            </form>}

            {/* ── Social Links ─────────────────────────────────────────────────────── */}
            {activeTab === "social" && <form onSubmit={saveSocialLinks} className="mx-auto max-w-2xl rounded-[1.75rem] bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-2xl font-black"><Link2 className="mr-2 inline h-6 w-6 text-[#0057FF]" />Social Links</h2>
              <div className="space-y-4">
                {[["Instagram", "instagram", "https://instagram.com/athoo_services"], ["Facebook", "facebook", "https://facebook.com/Athoo.Services/"], ["TikTok", "tiktok", "https://tiktok.com/@athoo.pk"], ["LinkedIn", "linkedin", "https://linkedin.com/company/..."], ["YouTube", "youtube", "https://youtube.com/@..."], ["Twitter / X", "twitter", "https://x.com/..."], ["WhatsApp Number", "whatsapp", "923390051068"]].map(([label, key, placeholder]) =>
                  <div key={key}><label className="mb-1 block text-sm font-semibold">{label}</label><Input value={(socialForm as any)[key] || ""} onChange={(e) => setSocialForm({ ...socialForm, [key]: e.target.value })} placeholder={placeholder as string} /></div>
                )}
                <Button type="submit" className="bg-[#0057FF]" disabled={extLoading}>Save Social Links</Button>
              </div>
            </form>}

            {/* ── Email Templates ──────────────────────────────────────────────────── */}
            {activeTab === "templates" && <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
              <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-xl font-black"><FileText className="mr-2 inline h-5 w-5 text-[#0057FF]" />{editingTemplate !== null ? "Edit Template" : "New Template"}</h2>
                <p className="mb-4 text-xs text-gray-400">Use {"{{name}}"}, {"{{phone}}"}, {"{{service}}"} as placeholders.</p>
                <Input className="mb-2 min-h-11" placeholder="Template name" value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} />
                <Input className="mb-2 min-h-11" placeholder="Email subject" value={templateForm.subject} onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })} />
                <textarea className="mb-3 min-h-[260px] w-full rounded-xl border p-3 font-mono text-sm" placeholder="Email body" value={templateForm.body} onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })} />
                <div className="flex gap-2">
                  <Button className="flex-1 bg-[#0057FF]" onClick={saveTemplate}>{editingTemplate !== null ? "Update" : "Save Template"}</Button>
                  {editingTemplate !== null && <Button variant="secondary" onClick={() => { setEditingTemplate(null); setTemplateForm({ name: "", subject: "", body: "" }); }}>Cancel</Button>}
                </div>
              </div>
              <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-xl font-black">Templates ({templates.length})</h2>
                <div className="space-y-3">
                  {templates.map((t) => <div key={t.id} className="rounded-2xl border p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1"><div className="font-bold">{t.name}</div><div className="mt-0.5 text-xs font-medium text-gray-500">{t.subject}</div><div className="mt-2 line-clamp-2 font-mono text-xs text-gray-400">{t.body.slice(0, 100)}...</div></div>
                      <div className="flex shrink-0 gap-1">
                        <Button size="sm" variant="secondary" onClick={() => editTemplate(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="secondary" title="Load into Bulk Email" onClick={() => { setEmailDraft({ subject: t.subject, message: t.body }); switchTab("email"); setNotice("Template loaded into Bulk Email."); }}><Send className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="secondary" title="Delete template" onClick={() => deleteTemplate(t.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </div>)}
                </div>
              </div>
            </div>}

            {/* ── Admins ──────────────────────────────────────────────────────────── */}
            {activeTab === "admins" && <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
              <form onSubmit={saveAdminUser} className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-xl font-black"><Plus className="mr-2 inline h-5 w-5" />Add Admin User</h2>
                <Input className="mb-3" placeholder="Name" value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} />
                <Input className="mb-3" placeholder="Email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} />
                <Input className="mb-3" placeholder="Password" type="password" value={adminForm.password || ""} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} />
                <select className="mb-3 min-h-12 w-full rounded-xl border px-3" value={adminForm.role} onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}>{roles.map(r => <option key={r} value={r}>{prettyRole(r)}</option>)}</select>
                <Button disabled={!canSettings} className="w-full bg-[#0057FF]">Save Admin</Button>
              </form>
              <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-xl font-black">Admin Users ({admins.length})</h2>
                <div className="space-y-3">{admins.map(a => <div key={a.email} className="rounded-2xl border p-4"><div className="font-bold">{a.name}</div><div className="text-sm text-gray-500">{a.email}</div><div className="mt-2 flex flex-wrap gap-2"><span className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-bold text-blue-700">{prettyRole(a.role)}</span><span className={`rounded-full px-3 py-0.5 text-xs font-bold ${a.is_active !== false ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{a.is_active !== false ? "Active" : "Disabled"}</span></div></div>)}{!admins.length && <p className="text-sm text-gray-500">No admin users.</p>}</div>
              </div>
            </div>}

            {/* ── Settings ─────────────────────────────────────────────────────────── */}
            {activeTab === "settings" && <form onSubmit={saveSettings} className="mx-auto max-w-2xl rounded-[1.75rem] bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-2xl font-black"><Wrench className="mr-2 inline h-6 w-6 text-[#0057FF]" />Site Settings</h2>
              <label className="mb-4 flex items-center gap-3 rounded-2xl bg-gray-50 p-4 font-bold cursor-pointer"><input type="checkbox" checked={maintenance.enabled} onChange={(e) => setMaintenance({ ...maintenance, enabled: e.target.checked })} />Maintenance Mode</label>
              <div className="space-y-3">
                <textarea className="min-h-[120px] w-full rounded-xl border p-4 text-sm" placeholder="Maintenance message" value={maintenance.message} onChange={(e) => setMaintenance({ ...maintenance, message: e.target.value })} />
                <Input placeholder="Support email" value={maintenance.supportEmail} onChange={(e) => setMaintenance({ ...maintenance, supportEmail: e.target.value })} />
                <Input placeholder="Support phone" value={maintenance.supportPhone} onChange={(e) => setMaintenance({ ...maintenance, supportPhone: e.target.value })} />
                <Button disabled={!canSettings || settingsSaving} className="bg-[#0057FF]">{settingsSaving ? "Saving..." : "Save Settings"}</Button>
                <p className="text-xs text-gray-400">Maintenance mode is stored in the database. Your app can read this flag to show/hide a maintenance banner.</p>
              </div>
            </form>}

            {/* ── Blog Categories ─────────────────────────────────────────────────── */}
            {activeTab === "blog-categories" && <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
              <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-xl font-black"><Tag className="mr-2 inline h-5 w-5 text-[#0057FF]" />Add Category</h2>
                <Input className="mb-2 min-h-11" placeholder="Category name *" value={blogCatForm.name} onChange={(e) => setBlogCatForm({ ...blogCatForm, name: e.target.value })} />
                <Input className="mb-3 min-h-11" placeholder="Description (optional)" value={blogCatForm.description} onChange={(e) => setBlogCatForm({ ...blogCatForm, description: e.target.value })} />
                <Button className="w-full bg-[#0057FF]" onClick={saveBlogCategory}><Plus className="mr-2 h-4 w-4" />Add Category</Button>
              </div>
              <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black">Categories ({blogCats.length})</h2><Button size="sm" variant="secondary" onClick={loadBlogCatsFromApi}><RefreshCw className="h-4 w-4" /></Button></div>
                <div className="space-y-2">
                  {blogCats.map(c => <div key={c.id} className="flex items-center justify-between rounded-2xl border p-4"><div><div className="font-bold">{c.name}</div><div className="text-xs text-gray-400">{c.slug}{c.description ? ` — ${c.description}` : ""}</div></div><Button size="sm" variant="secondary" onClick={() => deleteBlogCategory(c.id)} className="text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button></div>)}
                  {!blogCats.length && <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-gray-400">No categories yet. Add your first one →</div>}
                </div>
              </div>
            </div>}

            {/* ── CMS Content ─────────────────────────────────────────────────────── */}
            {activeTab === "cms" && <div className="rounded-[1.75rem] bg-white p-8 shadow-sm">
              <h2 className="mb-2 text-2xl font-black"><Layers className="mr-2 inline h-6 w-6 text-[#0057FF]" />CMS Content</h2>
              <p className="mb-6 text-gray-500">Manage dynamic page sections like the hero copy, About page text, and footer tagline. CMS sections are stored in the <code className="rounded bg-gray-100 px-1 text-xs">cms_sections</code> table and read by the frontend.</p>
              <form onSubmit={saveCmsSettings} className="space-y-5">
                <div className="rounded-2xl border p-5">
                  <h3 className="mb-3 font-bold text-gray-700">Hero Section</h3>
                  <div className="space-y-3">
                    <div><label className="mb-1 block text-xs font-semibold text-gray-500">Launch Badge Text</label><Input value={cmsForm.badge} onChange={(e) => setCmsForm({ ...cmsForm, badge: e.target.value })} placeholder="App Launching Soon in Pakistan" /></div>
                    <div><label className="mb-1 block text-xs font-semibold text-gray-500">Hero Title</label><Input value={cmsForm.heroTitle} onChange={(e) => setCmsForm({ ...cmsForm, heroTitle: e.target.value })} placeholder="Pakistan's Smart Home Services App Launching Soon" /></div>
                    <div><label className="mb-1 block text-xs font-semibold text-gray-500">Hero Subtitle</label><textarea className="min-h-[80px] w-full rounded-xl border p-3 text-sm" value={cmsForm.heroSubtitle} onChange={(e) => setCmsForm({ ...cmsForm, heroSubtitle: e.target.value })} placeholder="Connecting Islamabad & Rawalpindi with certified professionals…" /></div>
                    <div><label className="mb-1 block text-xs font-semibold text-gray-500">App Launch Date (for countdown)</label><Input type="date" value={cmsForm.launchDate} onChange={(e) => setCmsForm({ ...cmsForm, launchDate: e.target.value })} /></div>
                  </div>
                </div>
                <div className="rounded-2xl border p-5">
                  <h3 className="mb-3 font-bold text-gray-700">Contact & Support</h3>
                  <div className="space-y-3">
                    <div><label className="mb-1 block text-xs font-semibold text-gray-500">Support Email</label><Input value={cmsForm.supportEmail} onChange={(e) => setCmsForm({ ...cmsForm, supportEmail: e.target.value })} placeholder="official@athoo.pk" /></div>
                    <div><label className="mb-1 block text-xs font-semibold text-gray-500">Support Phone</label><Input value={cmsForm.supportPhone} onChange={(e) => setCmsForm({ ...cmsForm, supportPhone: e.target.value })} placeholder="+92 339 0051068" /></div>
                    <div><label className="mb-1 block text-xs font-semibold text-gray-500">WhatsApp Number (digits only)</label><Input value={cmsForm.whatsapp} onChange={(e) => setCmsForm({ ...cmsForm, whatsapp: e.target.value })} placeholder="923390051068" /></div>
                  </div>
                </div>
                <div className="rounded-2xl border p-5">
                  <h3 className="mb-3 font-bold text-gray-700">Site Metadata</h3>
                  <div className="space-y-3">
                    <div><label className="mb-1 block text-xs font-semibold text-gray-500">Site Title</label><Input value={cmsForm.siteTitle} onChange={(e) => setCmsForm({ ...cmsForm, siteTitle: e.target.value })} /></div>
                    <div><label className="mb-1 block text-xs font-semibold text-gray-500">Site Description</label><textarea className="min-h-[70px] w-full rounded-xl border p-3 text-sm" value={cmsForm.siteDescription} onChange={(e) => setCmsForm({ ...cmsForm, siteDescription: e.target.value })} /></div>
                  </div>
                </div>
                <Button type="submit" className="bg-[#0057FF]" disabled={cmsLoading}><Layers className="mr-2 h-4 w-4" />{cmsLoading ? "Saving…" : "Save CMS Settings"}</Button>
              </form>
            </div>}

            {/* ── Services Manager ────────────────────────────────────────────────── */}
            {activeTab === "services" && <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
              <form onSubmit={saveService} className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-xl font-black"><Package className="mr-2 inline h-5 w-5 text-[#0057FF]" />{editingSvc !== null ? "Edit Service" : "Add Service"}</h2>
                <Input className="mb-2 min-h-11" placeholder="Service name *" value={svcForm.name} onChange={(e) => setSvcForm({ ...svcForm, name: e.target.value })} />
                <Input className="mb-2 min-h-11" placeholder="Icon name (e.g. Wrench, Zap, Droplets)" value={svcForm.icon} onChange={(e) => setSvcForm({ ...svcForm, icon: e.target.value })} />
                <textarea className="mb-2 min-h-[80px] w-full rounded-xl border p-3 text-sm" placeholder="Description" value={svcForm.description} onChange={(e) => setSvcForm({ ...svcForm, description: e.target.value })} />
                <div className="mb-2 grid grid-cols-2 gap-2">
                  <Input placeholder="Starting price (PKR)" value={svcForm.startingPrice} onChange={(e) => setSvcForm({ ...svcForm, startingPrice: e.target.value })} />
                  <Input type="number" placeholder="Sort order" value={svcForm.sortOrder} onChange={(e) => setSvcForm({ ...svcForm, sortOrder: Number(e.target.value) })} />
                </div>
                <Input className="mb-2 min-h-11" placeholder="Cities (comma-separated)" value={svcForm.cities} onChange={(e) => setSvcForm({ ...svcForm, cities: e.target.value })} />
                <label className="mb-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={svcForm.isActive} onChange={(e) => setSvcForm({ ...svcForm, isActive: e.target.checked })} />Active (visible on site)</label>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-[#0057FF]" disabled={svcLoading}>{svcLoading ? "Saving…" : editingSvc !== null ? "Update Service" : "Add Service"}</Button>
                  {editingSvc !== null && <Button type="button" variant="secondary" onClick={() => { setEditingSvc(null); setSvcForm({ name: "", description: "", icon: "Wrench", startingPrice: "", cities: "Islamabad, Rawalpindi", isActive: true, sortOrder: 0 }); }}>Cancel</Button>}
                </div>
              </form>
              <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-black">Service Catalogue ({services.length})</h2>
                  <Button size="sm" variant="secondary" onClick={loadServices} disabled={svcLoading}><RefreshCw className="h-4 w-4" /></Button>
                </div>
                {svcLoading && <p className="mb-3 text-sm text-gray-400">Loading…</p>}
                <div className="space-y-3">
                  {services.map((s) => <div key={s.id} className="rounded-2xl border p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{s.name}</span>
                          {!s.is_active && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Inactive</span>}
                        </div>
                        <div className="mt-0.5 text-sm text-gray-500">{s.description}</div>
                        <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs text-gray-400">
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-600">icon: {s.icon}</span>
                          {s.starting_price && <span className="rounded-full bg-green-50 px-2 py-0.5 text-green-700">from Rs {s.starting_price.toLocaleString()}</span>}
                          {(s.cities || []).map((c: string) => <span key={c} className="rounded-full bg-gray-100 px-2 py-0.5">{c}</span>)}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button size="sm" variant="secondary" onClick={() => { setEditingSvc(s.id); setSvcForm({ name: s.name, description: s.description || "", icon: s.icon || "Wrench", startingPrice: s.starting_price ? String(s.starting_price) : "", cities: (s.cities || []).join(", "), isActive: s.is_active, sortOrder: s.sort_order || 0 }); }}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="secondary" onClick={() => deleteService(s.id)} className="text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </div>)}
                  {!services.length && !svcLoading && <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500"><Package className="mx-auto mb-3 h-8 w-8 text-gray-300" /><p className="mb-1 font-semibold">No services yet</p><p>Add your first service using the form on the left.</p></div>}
                </div>
              </div>
            </div>}

            {/* ── Roles & Permissions ─────────────────────────────────────────────── */}
            {activeTab === "roles" && <div className="rounded-[1.75rem] bg-white p-8 shadow-sm">
              <h2 className="mb-2 text-2xl font-black"><KeyRound className="mr-2 inline h-6 w-6 text-[#0057FF]" />Roles & Permissions</h2>
              <p className="mb-6 text-gray-500">Define what each admin role can do. Roles (<code className="rounded bg-gray-100 px-1 text-xs">super_admin</code>, <code className="rounded bg-gray-100 px-1 text-xs">admin</code>, <code className="rounded bg-gray-100 px-1 text-xs">manager</code>, <code className="rounded bg-gray-100 px-1 text-xs">custom</code>) are stored in the <code className="rounded bg-gray-100 px-1 text-xs">roles</code> and <code className="rounded bg-gray-100 px-1 text-xs">role_permissions</code> tables.</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {["super_admin","admin","manager","custom"].map(role => <div key={role} className="rounded-2xl border p-5">
                  <div className="mb-2 flex items-center gap-2"><KeyRound className="h-4 w-4 text-[#0057FF]" /><span className="font-bold capitalize">{role.replace("_"," ")}</span></div>
                  <div className="space-y-1 text-xs text-gray-500">
                    {role === "super_admin" && ["All permissions","Manage admins","Delete data","API access"].map(p => <div key={p} className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" />{p}</div>)}
                    {role === "admin" && ["Manage leads","Manage content","Send emails","View reports"].map(p => <div key={p} className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" />{p}</div>)}
                    {role === "manager" && ["View leads","Update status","View content"].map(p => <div key={p} className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" />{p}</div>)}
                    {role === "custom" && ["Configurable","Assigned per user"].map(p => <div key={p} className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-blue-400" />{p}</div>)}
                  </div>
                </div>)}
              </div>
            </div>}

            {/* ── Database Tools ─────────────────────────────────────────────────── */}
            {activeTab === "database" && <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-black"><Database className="mr-2 inline h-6 w-6 text-[#0057FF]" />Database Tools</h2>
                <Button size="sm" variant="secondary" onClick={loadDbStats} disabled={!dbStats.length && extLoading}><RefreshCw className="mr-1.5 h-3.5 w-3.5" />Refresh</Button>
              </div>
              <p className="mb-5 text-sm text-gray-500">Live row counts across all Athoo database tables. Schema is managed via <code className="rounded bg-gray-100 px-1 text-xs">dbInit.ts</code> which runs <code className="rounded bg-gray-100 px-1 text-xs">CREATE TABLE IF NOT EXISTS</code> on every boot.</p>
              {dbStats.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {dbStats.map(s => <div key={s.table} className="rounded-2xl border p-4">
                    <div className="text-2xl font-black text-[#0057FF]">{s.count >= 0 ? s.count : "—"}</div>
                    <div className="font-medium">{s.table}</div>
                    {s.count < 0 && <div className="text-xs text-red-400">Table not found</div>}
                  </div>)}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-gray-400">
                  <Database className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                  Click Refresh to load table statistics.
                </div>
              )}
            </div>}

            {/* ── Activity Logs ─────────────────────────────────────────────────────── */}
            {activeTab === "activity" && <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-black"><Database className="mr-2 inline h-5 w-5 text-[#0057FF]" />Activity Logs ({activity.length})</h2>
                <Button size="sm" variant="secondary" onClick={loadActivity}><RefreshCw className="h-4 w-4" /></Button>
              </div>
              <div className="space-y-3">
                {activity.map((a, i) => <div key={i} className="rounded-2xl border p-4 text-sm"><div className="font-bold">{a.action}</div><div className="text-gray-500">{a.admin_email} • {new Date(a.created_at).toLocaleString()} • {a.ip_address}</div><div className="text-gray-400">{a.target_type} {a.target_id}</div></div>)}
                {!activity.length && <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">No activity logged yet.</div>}
              </div>
            </div>}

          </main>
        </div>
      </div>

      {/* ── Global Search Modal (Ctrl+K) ─────────────────────────────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-20" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <Search className="h-5 w-5 text-gray-400" />
              <input autoFocus className="flex-1 bg-transparent text-base outline-none placeholder:text-gray-400" placeholder="Search leads, blog posts…" value={globalSearchQuery} onChange={(e) => setGlobalSearchQuery(e.target.value)} />
              <kbd className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-400">Esc</kbd>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {searchResults.length > 0 ? searchResults.map((r, i) => (
                <button key={i} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-blue-50" onClick={() => { switchTab(r.tab); setSearchOpen(false); setGlobalSearchQuery(""); }}>
                  <span className="shrink-0 rounded-lg bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-600">{r.type}</span>
                  <span className="min-w-0 flex-1 truncate font-medium">{r.label}</span>
                  <span className="shrink-0 text-xs text-gray-400">{r.sub}</span>
                </button>
              )) : globalSearchQuery ? (
                <div className="py-8 text-center text-sm text-gray-400">No results for "{globalSearchQuery}"</div>
              ) : (
                <div className="py-6 text-center text-sm text-gray-400">Start typing to search leads and blog posts…</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}



