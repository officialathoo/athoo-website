import { useEffect, useMemo, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import {
  Bell, Download, Lock, LogOut, Mail, RefreshCw, Search, ShieldCheck, SlidersHorizontal,
  UserCog, Users, Wrench, BarChart3, CheckCircle2, AlertTriangle, Send, Plus, Eye,
  FileText, Globe, Trash2, Edit2, X, ChevronLeft, ChevronRight, MessageSquare, Settings,
  TrendingUp, Activity, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

const ROLES = ["super_admin", "admin", "manager", "marketing", "support", "custom"];
const STATUSES = ["new", "contacted", "interested", "pending", "approved", "rejected", "spam"];
const PRIORITIES = ["normal", "high", "urgent"];
const CATEGORIES = ["general", "waitlist", "provider", "marketing", "support"];
const CHART_COLORS = ["#0057FF", "#FF8A00", "#10B981", "#8B5CF6", "#F43F5E", "#06B6D4"];

type AdminUser = { id?: number; name: string; email: string; role: string; is_active?: boolean; permissions?: Record<string, boolean>; last_login_at?: string; created_at?: string };
type Lead = {
  id: number; form_type: string; name?: string | null; email?: string | null; phone?: string | null;
  subject?: string | null; message?: string | null; service?: string | null; city?: string | null;
  experience?: string | null; source?: string | null; status: string; priority?: string | null;
  assigned_to?: string | null; admin_notes?: string | null; last_contacted_at?: string | null;
  created_at: string; updated_at?: string | null;
};
type Stats = { total: number; today: number; providers: number; waitlist: number; contacts: number; new_leads: number };
type Activity = { admin_email: string; action: string; target_type: string; target_id: string; details: Record<string, unknown>; ip_address: string; created_at: string };
type Settings = { maintenance_mode?: { enabled: boolean; message: string }; support_email?: string; support_phone?: string };
type Template = { id: number; name: string; subject: string; body: string; category: string; created_at: string };
type EmailLog = { id: number; lead_id: number; recipient: string; subject: string; status: string; created_at: string };
type Note = { id: number; admin_email: string; note: string; created_at: string };
type AnalyticsData = {
  daily: { day: string; count: number }[];
  byForm: { name: string; value: number }[];
  byStatus: { name: string; value: number }[];
  byCity: { name: string; value: number }[];
  weekly: { week: string; count: number }[];
  totals: Record<string, number>;
};
type CmsData = Record<string, unknown>;

type Tab = "dashboard" | "leads" | "email" | "cms" | "admins" | "settings" | "activity";

function authHeaders(token: string) { return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }; }
function prettyRole(role: string) { return role.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()); }
function prettyAction(action: string) { return action.replace(/_/g, " ").replace(/\b\w/g, m => m.toUpperCase()); }
function fmtDate(d: string | null | undefined) { if (!d) return "—"; return new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
function fmtDay(d: string | null | undefined) { if (!d) return "—"; return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }

const PERM_KEYS = ["view_leads", "manage_leads", "export_leads", "send_email", "manage_settings", "view_analytics", "manage_cms", "delete_leads"];
const PERM_LABELS: Record<string, string> = {
  view_leads: "View Leads", manage_leads: "Manage Leads", export_leads: "Export CSV",
  send_email: "Send Email", manage_settings: "Settings & Admins", view_analytics: "Analytics",
  manage_cms: "CMS Editor", delete_leads: "Delete Leads",
};

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem("athoo_admin_token") || "");
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    try { return JSON.parse(localStorage.getItem("athoo_admin_user") || "null"); } catch { return null; }
  });
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, today: 0, providers: 0, waitlist: 0, contacts: 0, new_leads: 0 });
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [settings, setSettings] = useState<Settings>({});
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [cms, setCms] = useState<CmsData>({});
  const [templates, setTemplates] = useState<Template[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [leadNotes, setLeadNotes] = useState<Note[]>([]);
  const [expandedLead, setExpandedLead] = useState<number | null>(null);
  const [newNote, setNewNote] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;
  const [filters, setFilters] = useState({ search: "", formType: "", status: "", priority: "", assignedTo: "", dateFrom: "", dateTo: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [emailDraft, setEmailDraft] = useState({ subject: "Athoo Launch Update", message: "Hi {{name}},\n\nThank you for joining Athoo. We have received your request and our team will contact you soon.\n\nRegards,\nAthoo Team" });
  const [adminForm, setAdminForm] = useState<AdminUser & { password?: string; permissions?: Record<string, boolean> }>({ name: "", email: "", role: "manager", password: "", is_active: true, permissions: {} });
  const [maintenance, setMaintenance] = useState({ enabled: false, message: "Athoo website is under maintenance. Please check back soon.", supportEmail: "official.athoo@gmail.com", supportPhone: "+92 339 0051068" });
  const [siteSettings, setSiteSettings] = useState({ title: "Athoo — Pakistan Smart Home Services", description: "", instagram: "", facebook: "", linkedin: "", whatsapp: "" });
  const [templateForm, setTemplateForm] = useState<Partial<Template>>({ name: "", subject: "", body: "", category: "general" });
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [cmsHero, setCmsHero] = useState({ title: "", subtitle: "", cta_customer: "Join Waitlist", cta_provider: "Become a Provider", badge: "App Launching Soon in Pakistan" });
  const [cmsContact, setCmsContact] = useState({ email: "", phone: "", whatsapp: "", address: "" });
  const [cmsAbout, setCmsAbout] = useState({ headline: "", description: "" });
  const [cmsSeo, setCmsSeo] = useState({ title: "", description: "" });
  const [cmsSocial, setCmsSocial] = useState({ instagram: "", facebook: "", linkedin: "" });

  const selectedLeads = useMemo(() => leads.filter((l) => selected.includes(l.id)), [leads, selected]);
  const canManage = admin?.role === "super_admin" || (admin?.permissions as any)?.all || (admin?.permissions as any)?.manage_leads;
  const canSettings = admin?.role === "super_admin" || (admin?.permissions as any)?.all || (admin?.permissions as any)?.manage_settings;
  const canExport = admin?.role === "super_admin" || (admin?.permissions as any)?.all || (admin?.permissions as any)?.export_leads;
  const canEmail = admin?.role === "super_admin" || (admin?.permissions as any)?.all || (admin?.permissions as any)?.send_email;

  function showNotice(msg: string) { setNotice(msg); setTimeout(() => setNotice(""), 4000); }
  function showError(msg: string) { setError(msg); setTimeout(() => setError(""), 6000); }

  async function login(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("athoo_admin_token", data.token);
      localStorage.setItem("athoo_admin_user", JSON.stringify(data.admin));
      setToken(data.token); setAdmin(data.admin); setPassword("");
    } catch (err) { setError(err instanceof Error ? err.message : "Login failed"); }
    finally { setLoading(false); }
  }

  function queryString() {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(page * PAGE_SIZE) });
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    return params.toString();
  }

  const loadLeads = useCallback(async () => {
    if (!token) return; setLoading(true); setError("");
    try {
      const response = await fetch(`/api/admin/leads?${queryString()}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (response.status === 401) { logout(); return; }
      if (!response.ok) throw new Error(data.error || "Could not load leads");
      setLeads(data.rows || []); setStats(data.stats || stats); setAdmins(data.admins || []);
    } catch (err) { showError(err instanceof Error ? err.message : "Could not load leads"); }
    finally { setLoading(false); }
  }, [token, page, filters]);

  async function loadAnalytics() {
    if (!token) return;
    try {
      const r = await fetch("/api/admin/analytics", { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json(); if (r.ok) setAnalytics(d);
    } catch {}
  }

  async function loadSettings() {
    if (!token) return;
    try {
      const r = await fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json(); if (!r.ok) return;
      setSettings(d.settings || {});
      setMaintenance({
        enabled: Boolean(d.settings?.maintenance_mode?.enabled),
        message: d.settings?.maintenance_mode?.message || "Athoo website is under maintenance. Please check back soon.",
        supportEmail: d.settings?.support_email || "official.athoo@gmail.com",
        supportPhone: d.settings?.support_phone || "+92 339 0051068",
      });
      setSiteSettings({
        title: String(d.settings?.site_title || "Athoo — Pakistan Smart Home Services"),
        description: String(d.settings?.site_description || ""),
        instagram: String(d.settings?.social_instagram || ""),
        facebook: String(d.settings?.social_facebook || ""),
        linkedin: String(d.settings?.social_linkedin || ""),
        whatsapp: String(d.settings?.whatsapp_number || ""),
      });
    } catch {}
  }

  async function loadCms() {
    if (!token) return;
    try {
      const r = await fetch("/api/admin/cms", { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json(); if (!r.ok) return;
      setCms(d.cms || {});
      const hero = (d.cms?.cms_hero || {}) as Record<string, string>;
      const contact = (d.cms?.cms_contact || {}) as Record<string, string>;
      const about = (d.cms?.cms_about || {}) as Record<string, string>;
      if (hero.title) setCmsHero({ title: hero.title || "", subtitle: hero.subtitle || "", cta_customer: hero.cta_customer || "Join Waitlist", cta_provider: hero.cta_provider || "Become a Provider", badge: hero.badge || "" });
      if (contact.email) setCmsContact({ email: contact.email || "", phone: contact.phone || "", whatsapp: contact.whatsapp || "", address: contact.address || "" });
      if (about.headline) setCmsAbout({ headline: about.headline || "", description: about.description || "" });
      setCmsSeo({ title: String(d.cms?.site_title || ""), description: String(d.cms?.site_description || "") });
      setCmsSocial({ instagram: String(d.cms?.social_instagram || ""), facebook: String(d.cms?.social_facebook || ""), linkedin: String(d.cms?.social_linkedin || "") });
    } catch {}
  }

  async function loadAdmins() {
    if (!token) return;
    try { const r = await fetch("/api/admin/admins", { headers: { Authorization: `Bearer ${token}` } }); const d = await r.json(); if (r.ok) setAdmins(d.rows || []); } catch {}
  }

  async function loadActivity() {
    if (!token) return;
    try { const r = await fetch("/api/admin/activity", { headers: { Authorization: `Bearer ${token}` } }); const d = await r.json(); if (r.ok) setActivity(d.rows || []); } catch {}
  }

  async function loadTemplates() {
    if (!token) return;
    try { const r = await fetch("/api/admin/templates", { headers: { Authorization: `Bearer ${token}` } }); const d = await r.json(); if (r.ok) setTemplates(d.rows || []); } catch {}
  }

  async function loadEmailLogs() {
    if (!token) return;
    try { const r = await fetch("/api/admin/email-logs", { headers: { Authorization: `Bearer ${token}` } }); const d = await r.json(); if (r.ok) setEmailLogs(d.rows || []); } catch {}
  }

  async function loadLeadNotes(leadId: number) {
    if (!token) return;
    try { const r = await fetch(`/api/admin/lead-notes/${leadId}`, { headers: { Authorization: `Bearer ${token}` } }); const d = await r.json(); if (r.ok) setLeadNotes(d.rows || []); } catch {}
  }

  function logout() { localStorage.removeItem("athoo_admin_token"); localStorage.removeItem("athoo_admin_user"); setToken(""); setAdmin(null); setLeads([]); }

  function exportCsv() {
    if (!canExport) return showError("Permission denied");
    const params = new URLSearchParams(queryString());
    fetch(`/api/admin/export?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob()).then((blob) => { const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "athoo-leads.csv"; link.click(); });
  }

  async function updateLeads(patch: Record<string, unknown>, ids = selected) {
    if (!ids.length) return showError("Select at least one lead first.");
    setLoading(true);
    try {
      const r = await fetch("/api/admin/lead-update", { method: "POST", headers: authHeaders(token), body: JSON.stringify({ ids, ...patch }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Update failed");
      showNotice("Lead updated."); setSelected([]); await loadLeads();
    } catch (err) { showError(err instanceof Error ? err.message : "Update failed"); }
    finally { setLoading(false); }
  }

  async function sendBulkEmail() {
    if (!canEmail) return showError("Permission denied");
    const ids = selected.length ? selected : leads.map((l) => l.id);
    if (!ids.length) return showError("Select leads first.");
    setLoading(true);
    try {
      const r = await fetch("/api/admin/bulk-email", { method: "POST", headers: authHeaders(token), body: JSON.stringify({ ids, ...emailDraft }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Email failed");
      showNotice(d.note || `Sent: ${d.sent}, skipped: ${d.skipped}`);
      await loadEmailLogs();
    } catch (err) { showError(err instanceof Error ? err.message : "Email failed"); }
    finally { setLoading(false); }
  }

  async function saveAdminUser(e: React.FormEvent) {
    e.preventDefault();
    try {
      const r = await fetch("/api/admin/admins", { method: "POST", headers: authHeaders(token), body: JSON.stringify(adminForm) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Could not save admin");
      showNotice("Admin user saved."); setAdminForm({ name: "", email: "", role: "manager", password: "", is_active: true, permissions: {} }); await loadAdmins();
    } catch (err) { showError(err instanceof Error ? err.message : "Could not save admin"); }
  }

  async function deleteAdmin(id: number) {
    if (!confirm("Delete this admin user?")) return;
    try {
      const r = await fetch(`/api/admin/admins/${id}`, { method: "DELETE", headers: authHeaders(token) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Could not delete");
      showNotice("Admin deleted."); await loadAdmins();
    } catch (err) { showError(err instanceof Error ? err.message : "Could not delete admin"); }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    try {
      const r = await fetch("/api/admin/settings", { method: "POST", headers: authHeaders(token), body: JSON.stringify({ maintenanceEnabled: maintenance.enabled, maintenanceMessage: maintenance.message, supportEmail: maintenance.supportEmail, supportPhone: maintenance.supportPhone }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Could not save settings");
      showNotice("Settings saved.");
    } catch (err) { showError(err instanceof Error ? err.message : "Could not save settings"); }
  }

  async function saveCms(e: React.FormEvent) {
    e.preventDefault();
    try {
      const r = await fetch("/api/admin/cms", { method: "POST", headers: authHeaders(token), body: JSON.stringify({ cms_hero: cmsHero, cms_contact: cmsContact, cms_about: cmsAbout, site_title: cmsSeo.title, site_description: cmsSeo.description, social_instagram: cmsSocial.instagram, social_facebook: cmsSocial.facebook, social_linkedin: cmsSocial.linkedin }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Could not save CMS");
      showNotice("CMS content saved. Refresh the website to see changes.");
    } catch (err) { showError(err instanceof Error ? err.message : "Could not save CMS"); }
  }

  async function saveTemplate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = editingTemplate ? { ...templateForm, id: editingTemplate.id } : templateForm;
      const r = await fetch("/api/admin/templates", { method: "POST", headers: authHeaders(token), body: JSON.stringify(payload) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Could not save template");
      showNotice("Template saved."); setTemplateForm({ name: "", subject: "", body: "", category: "general" }); setEditingTemplate(null); await loadTemplates();
    } catch (err) { showError(err instanceof Error ? err.message : "Could not save template"); }
  }

  async function deleteTemplate(id: number) {
    if (!confirm("Delete this template?")) return;
    try {
      const r = await fetch(`/api/admin/templates/${id}`, { method: "DELETE", headers: authHeaders(token) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error);
      showNotice("Template deleted."); await loadTemplates();
    } catch (err) { showError(err instanceof Error ? err.message : "Could not delete template"); }
  }

  async function addNote(leadId: number) {
    if (!newNote.trim()) return;
    try {
      const r = await fetch("/api/admin/lead-note", { method: "POST", headers: authHeaders(token), body: JSON.stringify({ leadId, note: newNote }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error);
      setNewNote(""); await loadLeadNotes(leadId); showNotice("Note added.");
    } catch (err) { showError(err instanceof Error ? err.message : "Could not add note"); }
  }

  useEffect(() => { if (token) { loadLeads(); loadAnalytics(); loadSettings(); } }, [token]);
  useEffect(() => { if (token && activeTab === "leads") loadLeads(); }, [activeTab, page, token]);
  useEffect(() => {
    if (!token) return;
    if (activeTab === "admins") loadAdmins();
    if (activeTab === "activity") loadActivity();
    if (activeTab === "email") { loadTemplates(); loadEmailLogs(); }
    if (activeTab === "cms") loadCms();
    if (activeTab === "dashboard") loadAnalytics();
  }, [activeTab, token]);
  useEffect(() => { if (expandedLead) loadLeadNotes(expandedLead); }, [expandedLead]);

  if (!token) return (
    <><Helmet><title>Athoo Admin Login</title></Helmet>
      <main className="min-h-screen bg-[#081120] px-4 py-10 text-white sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
          <div className="hidden lg:block">
            <img src="/athoo-logo.png" alt="Athoo" className="mb-8 h-20 w-20 rounded-3xl bg-white p-2 shadow-2xl" />
            <h1 className="text-5xl font-black leading-tight">Athoo Enterprise Admin</h1>
            <p className="mt-5 max-w-xl text-lg text-gray-300">Full CRM, analytics, CMS, email marketing, role management, and audit logs — all in one secure dashboard.</p>
            <div className="mt-8 flex flex-col gap-3">
              {[["CRM & Lead Management", "Search, filter, assign, export leads"], ["Email Marketing", "Bulk email with templates and delivery logs"], ["Analytics Dashboard", "Real-time charts and conversion tracking"], ["CMS Editor", "Edit homepage content without code"]].map(([t, d]) => (
                <div key={t} className="flex items-start gap-3"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#0057FF]" /><div><div className="font-bold">{t}</div><div className="text-sm text-gray-400">{d}</div></div></div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] bg-white p-6 text-gray-900 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600"><Lock /></div><div><h1 className="text-2xl font-black">Athoo Admin</h1><p className="text-sm text-gray-500">Secure enterprise dashboard</p></div></div>
            <form onSubmit={login} className="space-y-4">
              <Input type="email" placeholder="Admin email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} className="min-h-12" autoComplete="email" />
              <Input type="password" placeholder="Admin password" value={password} onChange={(e) => setPassword(e.target.value)} className="min-h-12" autoComplete="current-password" required />
              {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600"><AlertTriangle className="mr-1 inline h-4 w-4" />{error}</p>}
              <Button className="min-h-12 w-full rounded-xl bg-[#0057FF] text-white hover:bg-blue-700" disabled={loading}>{loading ? "Verifying..." : "Login to Dashboard"}</Button>
            </form>
          </div>
        </div>
      </main>
    </>
  );

  const tabs: { id: Tab; icon: any; label: string }[] = [
    { id: "dashboard", icon: BarChart3, label: "Dashboard" },
    { id: "leads", icon: Users, label: "Leads CRM" },
    { id: "email", icon: Mail, label: "Email" },
    { id: "cms", icon: Globe, label: "CMS" },
    { id: "admins", icon: UserCog, label: "Admins" },
    { id: "settings", icon: Wrench, label: "Settings" },
    { id: "activity", icon: Activity, label: "Audit Log" },
  ];

  return (
    <><Helmet><title>Athoo Admin — Enterprise Dashboard</title></Helmet>
      <main className="min-h-screen bg-[#f5f7fb] text-gray-900">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 p-3 sm:p-5 lg:flex-row">

          {/* Sidebar */}
          <aside className="rounded-[1.75rem] bg-[#081120] p-4 text-white shadow-xl lg:sticky lg:top-5 lg:h-[calc(100vh-40px)] lg:w-64 lg:overflow-y-auto xl:w-72">
            <div className="mb-6 flex items-center gap-3">
              <img src="/athoo-logo.png" alt="Athoo" className="h-12 w-12 rounded-2xl bg-white p-1" />
              <div><div className="text-lg font-black">Athoo</div><div className="text-xs uppercase tracking-widest text-blue-200">Enterprise Admin</div></div>
            </div>
            <div className="mb-5 rounded-2xl bg-white/10 p-3 text-sm">
              <div className="font-bold">{admin?.name || "Admin"}</div>
              <div className="truncate text-xs text-gray-300">{admin?.email}</div>
              <div className="mt-2 inline-flex rounded-full bg-[#0057FF] px-3 py-1 text-xs font-bold">{prettyRole(admin?.role || "admin")}</div>
            </div>
            <nav className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              {tabs.map(({ id, icon: Icon, label }) => (
                <button key={id} onClick={() => setActiveTab(id)} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${activeTab === id ? "bg-white text-[#0057FF]" : "bg-white/5 text-gray-300 hover:bg-white/10"}`}>
                  <Icon className="h-4 w-4 shrink-0" /> {label}
                </button>
              ))}
              <button onClick={logout} className="col-span-2 flex items-center gap-3 rounded-2xl bg-red-500/20 px-4 py-3 text-left text-sm font-bold text-red-200 hover:bg-red-500/30 lg:col-span-1">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </nav>
          </aside>

          {/* Main content */}
          <section className="min-w-0 flex-1 space-y-4">
            {/* Header bar */}
            <div className="rounded-[1.75rem] bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h1 className="text-xl font-black sm:text-3xl">{tabs.find(t => t.id === activeTab)?.label}</h1>
                  <p className="text-sm text-gray-500">Athoo Enterprise — {admin?.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => { loadLeads(); loadAnalytics(); }}><RefreshCw className="mr-1 h-4 w-4" /> Refresh</Button>
                  {canExport && <Button size="sm" onClick={exportCsv} className="bg-[#0057FF] text-white"><Download className="mr-1 h-4 w-4" /> Export CSV</Button>}
                </div>
              </div>
            </div>

            {error && <div className="rounded-2xl bg-red-50 p-4 font-semibold text-red-600"><AlertTriangle className="mr-2 inline h-4 w-4" />{error}</div>}
            {notice && <div className="rounded-2xl bg-green-50 p-4 font-semibold text-green-700"><CheckCircle2 className="mr-2 inline h-4 w-4" />{notice}</div>}

            {/* ===================== DASHBOARD ===================== */}
            {activeTab === "dashboard" && (
              <div className="space-y-4">
                {/* KPI cards */}
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "Total Leads", value: analytics?.totals?.total ?? stats.total, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Today", value: analytics?.totals?.today ?? stats.today, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
                    { label: "This Week", value: analytics?.totals?.this_week ?? 0, icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
                    { label: "This Month", value: analytics?.totals?.this_month ?? 0, icon: BarChart3, color: "text-orange-500", bg: "bg-orange-50" },
                    { label: "New (Unread)", value: analytics?.totals?.new_leads ?? stats.new_leads, icon: Bell, color: "text-red-500", bg: "bg-red-50" },
                    { label: "Providers", value: analytics?.totals?.providers ?? stats.providers, icon: ShieldCheck, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Waitlist", value: analytics?.totals?.waitlist ?? stats.waitlist, icon: Layers, color: "text-teal-600", bg: "bg-teal-50" },
                    { label: "Approved", value: analytics?.totals?.approved ?? 0, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                  ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="rounded-3xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                      <div className={`mb-3 inline-flex rounded-2xl p-2 ${bg}`}><Icon className={`h-5 w-5 ${color}`} /></div>
                      <div className="text-3xl font-black">{value ?? 0}</div>
                      <div className="text-sm font-medium text-gray-500">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Daily trend chart */}
                <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                  <h2 className="mb-4 font-black text-lg">Daily Leads — Last 30 Days</h2>
                  {analytics?.daily?.length ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={analytics.daily}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={2} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#0057FF" strokeWidth={2.5} dot={false} name="Leads" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : <div className="flex h-40 items-center justify-center text-gray-400 text-sm">No data yet — submit a form to see trends</div>}
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                  {/* Form type distribution */}
                  <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                    <h2 className="mb-4 font-black text-lg">Lead Sources</h2>
                    {analytics?.byForm?.length ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={analytics.byForm} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name.replace(" Form", "").replace(" Signup", "")} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                            {analytics.byForm.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <div className="flex h-40 items-center justify-center text-gray-400 text-sm">No data</div>}
                  </div>

                  {/* Status distribution */}
                  <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                    <h2 className="mb-4 font-black text-lg">Lead Status</h2>
                    {analytics?.byStatus?.length ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={analytics.byStatus} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={70} />
                          <Tooltip />
                          <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]}>
                            {analytics.byStatus.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <div className="flex h-40 items-center justify-center text-gray-400 text-sm">No data</div>}
                  </div>

                  {/* City distribution */}
                  <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                    <h2 className="mb-4 font-black text-lg">Top Cities</h2>
                    {analytics?.byCity?.length ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={analytics.byCity} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#FF8A00" name="Leads" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <div className="flex h-40 items-center justify-center text-gray-400 text-sm">No city data — add city field to forms</div>}
                  </div>
                </div>

                {/* Weekly trend */}
                <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                  <h2 className="mb-4 font-black text-lg">Weekly Trend — Last 12 Weeks</h2>
                  {analytics?.weekly?.length ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={analytics.weekly}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#0057FF" name="Leads" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="flex h-32 items-center justify-center text-gray-400 text-sm">No weekly data yet</div>}
                </div>
              </div>
            )}

            {/* ===================== LEADS CRM ===================== */}
            {activeTab === "leads" && (
              <div className="space-y-4">
                {/* Stats strip */}
                <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                  {[["Total", stats.total, "#0057FF"], ["Today", stats.today, "#10B981"], ["New", stats.new_leads, "#F43F5E"], ["Providers", stats.providers, "#8B5CF6"], ["Waitlist", stats.waitlist, "#FF8A00"], ["Contacts", stats.contacts, "#06B6D4"]].map(([label, val, color]: any) => (
                    <div key={label} className="rounded-3xl bg-white p-4 shadow-sm">
                      <div className="text-2xl font-black" style={{ color }}>{val ?? 0}</div>
                      <div className="text-xs font-semibold text-gray-500">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Filters */}
                <div className="rounded-[1.75rem] bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center gap-2 font-black"><SlidersHorizontal className="h-5 w-5 text-[#0057FF]" /> Filters & Search</div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="relative"><Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" /><Input className="min-h-11 pl-10" placeholder="Name, email, phone, message..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></div>
                    <select className="min-h-11 rounded-xl border px-3 text-sm" value={filters.formType} onChange={(e) => setFilters({ ...filters, formType: e.target.value })}><option value="">All form types</option><option>Contact Form</option><option>Waitlist Signup</option><option>Provider Waitlist</option></select>
                    <select className="min-h-11 rounded-xl border px-3 text-sm" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">All statuses</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
                    <select className="min-h-11 rounded-xl border px-3 text-sm" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}><option value="">All priorities</option>{PRIORITIES.map(s => <option key={s}>{s}</option>)}</select>
                    <Input placeholder="Filter by city..." className="min-h-11" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
                    <Input type="date" className="min-h-11" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} />
                    <Input type="date" className="min-h-11" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} />
                    <div className="flex gap-2">
                      <Button className="min-h-11 flex-1 bg-[#0057FF] text-white" onClick={() => { setPage(0); loadLeads(); }} disabled={loading}>{loading ? "Loading..." : "Apply"}</Button>
                      <Button variant="secondary" className="min-h-11" onClick={() => { setFilters({ search: "", formType: "", status: "", priority: "", assignedTo: "", dateFrom: "", dateTo: "", city: "" }); setPage(0); }}>Clear</Button>
                    </div>
                  </div>
                </div>

                {/* Bulk actions */}
                {selected.length > 0 && (
                  <div className="rounded-3xl bg-[#081120] p-4 text-white">
                    <div className="mb-3 flex items-center justify-between"><span className="font-bold">{selected.length} leads selected</span><button onClick={() => setSelected([])} className="text-gray-400 hover:text-white"><X className="h-4 w-4" /></button></div>
                    <div className="flex flex-wrap gap-2">
                      {STATUSES.map(s => <Button key={s} size="sm" variant="secondary" onClick={() => updateLeads({ status: s })} className="capitalize">{s}</Button>)}
                      <Button size="sm" className="bg-[#FF8A00] text-white" onClick={() => updateLeads({ priority: "urgent" })}>Mark Urgent</Button>
                      <Button size="sm" className="bg-blue-500 text-white" onClick={() => { setActiveTab("email"); }}>Email Selected</Button>
                    </div>
                  </div>
                )}

                {/* Leads table */}
                <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] text-left text-sm">
                      <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
                        <tr>
                          <th className="p-4"><input type="checkbox" onChange={(e) => setSelected(e.target.checked ? leads.map(l => l.id) : [])} checked={leads.length > 0 && selected.length === leads.length} /></th>
                          <th className="p-4">Date</th><th className="p-4">Form</th><th className="p-4">Name</th><th className="p-4">Contact</th>
                          <th className="p-4">Service/City</th><th className="p-4">Message</th><th className="p-4">Status</th><th className="p-4">Priority</th><th className="p-4">Assigned</th><th className="p-4">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leads.map((lead) => (
                          <>
                            <tr key={lead.id} className={`border-t align-top transition hover:bg-blue-50/30 ${expandedLead === lead.id ? "bg-blue-50/50" : ""}`}>
                              <td className="p-4"><input type="checkbox" checked={selected.includes(lead.id)} onChange={(e) => setSelected(e.target.checked ? [...selected, lead.id] : selected.filter(id => id !== lead.id))} /></td>
                              <td className="p-4 text-xs text-gray-400 whitespace-nowrap">{fmtDay(lead.created_at)}</td>
                              <td className="p-4"><span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{lead.form_type.replace(" Waitlist", "").replace(" Form", "")}</span></td>
                              <td className="p-4 font-semibold">{lead.name || "—"}</td>
                              <td className="p-4 text-xs"><div className="font-medium text-blue-600">{lead.email || "—"}</div><div className="text-gray-500">{lead.phone || ""}</div></td>
                              <td className="p-4 text-xs"><div className="font-medium">{lead.service || "—"}</div><div className="text-gray-400">{lead.city || ""}</div></td>
                              <td className="max-w-[200px] p-4 text-xs"><div className="line-clamp-2 text-gray-600">{lead.message || lead.subject || lead.experience || "—"}</div>{lead.admin_notes && <div className="mt-1 rounded-lg bg-yellow-50 p-1.5 text-yellow-800">{lead.admin_notes}</div>}</td>
                              <td className="p-4">
                                <select className="rounded-lg border px-1.5 py-1 text-xs" value={lead.status} disabled={!canManage} onChange={(e) => updateLeads({ status: e.target.value }, [lead.id])}>
                                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                                </select>
                              </td>
                              <td className="p-4">
                                <select className="rounded-lg border px-1.5 py-1 text-xs" value={lead.priority || "normal"} disabled={!canManage} onChange={(e) => updateLeads({ priority: e.target.value }, [lead.id])}>
                                  {PRIORITIES.map(s => <option key={s}>{s}</option>)}
                                </select>
                              </td>
                              <td className="p-4">
                                <select className="max-w-[120px] rounded-lg border px-1.5 py-1 text-xs" value={lead.assigned_to || ""} disabled={!canManage} onChange={(e) => updateLeads({ assignedTo: e.target.value }, [lead.id])}>
                                  <option value="">Unassigned</option>
                                  {admins.map(a => <option key={a.email} value={a.email}>{a.name}</option>)}
                                </select>
                              </td>
                              <td className="p-4">
                                <button onClick={() => { setExpandedLead(expandedLead === lead.id ? null : lead.id); }} className="flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200">
                                  <MessageSquare className="h-3 w-3" /> Notes {expandedLead === lead.id ? <ChevronLeft className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </button>
                              </td>
                            </tr>
                            {expandedLead === lead.id && (
                              <tr key={`${lead.id}-notes`} className="bg-blue-50/30">
                                <td colSpan={11} className="border-t px-6 py-4">
                                  <div className="mb-3 font-bold text-sm">Notes & Timeline — {lead.name || lead.email}</div>
                                  <div className="mb-3 space-y-2 max-h-48 overflow-y-auto">
                                    {leadNotes.length ? leadNotes.map(n => (
                                      <div key={n.id} className="rounded-xl bg-white p-3 text-xs shadow-sm">
                                        <div className="font-semibold text-gray-800">{n.note}</div>
                                        <div className="mt-1 text-gray-400">{n.admin_email} · {fmtDate(n.created_at)}</div>
                                      </div>
                                    )) : <p className="text-sm text-gray-400">No notes yet.</p>}
                                  </div>
                                  <div className="flex gap-2">
                                    <Input placeholder="Add a note..." className="text-sm" value={newNote} onChange={(e) => setNewNote(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addNote(lead.id); }} />
                                    <Button size="sm" className="bg-[#0057FF] text-white" onClick={() => addNote(lead.id)}>Add</Button>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        ))}
                        {!leads.length && <tr><td colSpan={11} className="p-10 text-center text-gray-400">No leads found. Try adjusting your filters.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  <div className="flex items-center justify-between border-t px-6 py-3 text-sm">
                    <span className="text-gray-500">Showing {page * PAGE_SIZE + 1}–{page * PAGE_SIZE + leads.length}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}><ChevronLeft className="h-4 w-4" /></Button>
                      <span className="flex items-center px-2 font-bold">Page {page + 1}</span>
                      <Button size="sm" variant="secondary" disabled={leads.length < PAGE_SIZE} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== EMAIL ===================== */}
            {activeTab === "email" && (
              <div className="space-y-4">
                <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
                  <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                    <h2 className="mb-1 text-xl font-black">Compose Email</h2>
                    <p className="mb-4 text-sm text-gray-500">Use <code className="rounded bg-gray-100 px-1">{"{{name}}"}</code>, <code className="rounded bg-gray-100 px-1">{"{{email}}"}</code>, <code className="rounded bg-gray-100 px-1">{"{{service}}"}</code>, <code className="rounded bg-gray-100 px-1">{"{{city}}"}</code> as variables.</p>
                    <Input className="mb-3 min-h-11" placeholder="Email subject" value={emailDraft.subject} onChange={(e) => setEmailDraft({ ...emailDraft, subject: e.target.value })} />
                    <textarea className="min-h-[220px] w-full rounded-xl border p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" value={emailDraft.message} onChange={(e) => setEmailDraft({ ...emailDraft, message: e.target.value })} placeholder="Write your email..." />
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button className="bg-[#0057FF] text-white" onClick={sendBulkEmail} disabled={loading}>
                        <Send className="mr-2 h-4 w-4" /> {selected.length ? `Send to ${selected.length} Selected` : "Send to All Filtered Leads"}
                      </Button>
                    </div>
                  </div>
                  {/* Recipients preview */}
                  <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                    <h3 className="mb-3 font-black">Recipients</h3>
                    <p className="mb-3 text-xs text-gray-500">{selected.length ? `${selected.length} selected leads` : `All ${leads.length} current filtered leads`}</p>
                    <div className="max-h-64 space-y-2 overflow-y-auto">
                      {(selected.length ? selectedLeads : leads.slice(0, 20)).map(l => (
                        <div key={l.id} className="rounded-xl bg-gray-50 p-2.5 text-xs">
                          <div className="font-semibold">{l.name || "No name"}</div>
                          <div className="text-gray-400">{l.email || "No email"} • {l.form_type}</div>
                        </div>
                      ))}
                      {!selected.length && leads.length > 20 && <p className="text-center text-xs text-gray-400">+{leads.length - 20} more leads</p>}
                    </div>
                  </div>
                </div>

                {/* Email templates */}
                <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-black">Email Templates</h2>
                    <Button size="sm" className="bg-[#0057FF] text-white" onClick={() => { setEditingTemplate(null); setTemplateForm({ name: "", subject: "", body: "", category: "general" }); }}>
                      <Plus className="mr-1 h-4 w-4" /> New Template
                    </Button>
                  </div>

                  {/* Template form */}
                  {(editingTemplate !== null || templateForm.name !== undefined) && (
                    <form onSubmit={saveTemplate} className="mb-6 rounded-2xl bg-gray-50 p-4">
                      <div className="mb-3 font-bold">{editingTemplate ? "Edit Template" : "Create New Template"}</div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input placeholder="Template name" value={templateForm.name || ""} onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })} required />
                        <select className="rounded-xl border px-3 py-2 text-sm" value={templateForm.category || "general"} onChange={e => setTemplateForm({ ...templateForm, category: e.target.value })}>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <Input className="my-3" placeholder="Email subject" value={templateForm.subject || ""} onChange={e => setTemplateForm({ ...templateForm, subject: e.target.value })} required />
                      <textarea className="min-h-[160px] w-full rounded-xl border p-3 text-sm" placeholder="Email body (use {{name}}, {{service}}, {{city}})" value={templateForm.body || ""} onChange={e => setTemplateForm({ ...templateForm, body: e.target.value })} required />
                      <div className="mt-3 flex gap-2">
                        <Button type="submit" className="bg-[#0057FF] text-white">Save Template</Button>
                        <Button type="button" variant="secondary" onClick={() => { setEditingTemplate(null); setTemplateForm({ name: "", subject: "", body: "", category: "general" }); }}>Cancel</Button>
                      </div>
                    </form>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {templates.map(t => (
                      <div key={t.id} className="rounded-2xl border p-4">
                        <div className="mb-1 flex items-start justify-between gap-2">
                          <div className="font-bold text-sm">{t.name}</div>
                          <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">{t.category}</span>
                        </div>
                        <div className="mb-2 text-xs text-gray-500 line-clamp-1">{t.subject}</div>
                        <div className="mb-3 text-xs text-gray-400 line-clamp-2">{t.body}</div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" className="text-xs" onClick={() => { setEmailDraft({ subject: t.subject, message: t.body }); showNotice(`Template "${t.name}" loaded into compose.`); }}>Use</Button>
                          <Button size="sm" variant="secondary" className="text-xs" onClick={() => { setEditingTemplate(t); setTemplateForm({ name: t.name, subject: t.subject, body: t.body, category: t.category }); }}><Edit2 className="h-3 w-3" /></Button>
                          <Button size="sm" variant="secondary" className="text-xs text-red-500" onClick={() => deleteTemplate(t.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    ))}
                    {!templates.length && <p className="col-span-3 text-sm text-gray-400">No templates yet.</p>}
                  </div>
                </div>

                {/* Email logs */}
                <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                  <h2 className="mb-4 text-xl font-black">Email Sending Logs</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-left text-sm">
                      <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500">
                        <tr><th className="p-3">Date</th><th className="p-3">Recipient</th><th className="p-3">Subject</th><th className="p-3">Status</th></tr>
                      </thead>
                      <tbody>
                        {emailLogs.map(log => (
                          <tr key={log.id} className="border-t hover:bg-gray-50">
                            <td className="p-3 text-xs text-gray-400 whitespace-nowrap">{fmtDate(log.created_at)}</td>
                            <td className="p-3 text-xs text-blue-600">{log.recipient}</td>
                            <td className="p-3 text-xs max-w-[240px] line-clamp-1">{log.subject}</td>
                            <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${log.status === "sent" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>{log.status}</span></td>
                          </tr>
                        ))}
                        {!emailLogs.length && <tr><td colSpan={4} className="p-6 text-center text-gray-400">No email logs yet.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== CMS ===================== */}
            {activeTab === "cms" && (
              <form onSubmit={saveCms} className="space-y-4">
                {/* Hero section */}
                <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                  <h2 className="mb-4 text-xl font-black flex items-center gap-2"><Globe className="h-5 w-5 text-[#0057FF]" /> Hero Section</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div><label className="mb-1 block text-xs font-bold text-gray-600">Hero Title</label><Input value={cmsHero.title} onChange={e => setCmsHero({ ...cmsHero, title: e.target.value })} placeholder="Pakistan's Smart Home Services App" /></div>
                    <div><label className="mb-1 block text-xs font-bold text-gray-600">Top Badge Text</label><Input value={cmsHero.badge} onChange={e => setCmsHero({ ...cmsHero, badge: e.target.value })} placeholder="App Launching Soon in Pakistan" /></div>
                    <div className="sm:col-span-2"><label className="mb-1 block text-xs font-bold text-gray-600">Subtitle / Description</label><textarea className="w-full rounded-xl border p-3 text-sm" rows={3} value={cmsHero.subtitle} onChange={e => setCmsHero({ ...cmsHero, subtitle: e.target.value })} placeholder="Short description..." /></div>
                    <div><label className="mb-1 block text-xs font-bold text-gray-600">Customer CTA Button</label><Input value={cmsHero.cta_customer} onChange={e => setCmsHero({ ...cmsHero, cta_customer: e.target.value })} placeholder="Join Waitlist" /></div>
                    <div><label className="mb-1 block text-xs font-bold text-gray-600">Provider CTA Button</label><Input value={cmsHero.cta_provider} onChange={e => setCmsHero({ ...cmsHero, cta_provider: e.target.value })} placeholder="Become a Provider" /></div>
                  </div>
                </div>

                {/* About section */}
                <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                  <h2 className="mb-4 text-xl font-black">About Section</h2>
                  <div className="grid gap-3">
                    <div><label className="mb-1 block text-xs font-bold text-gray-600">Headline</label><Input value={cmsAbout.headline} onChange={e => setCmsAbout({ ...cmsAbout, headline: e.target.value })} placeholder="Building Pakistan's Most Trusted Home Services Platform" /></div>
                    <div><label className="mb-1 block text-xs font-bold text-gray-600">Description</label><textarea className="w-full rounded-xl border p-3 text-sm" rows={4} value={cmsAbout.description} onChange={e => setCmsAbout({ ...cmsAbout, description: e.target.value })} placeholder="About Athoo description..." /></div>
                  </div>
                </div>

                {/* Contact info */}
                <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                  <h2 className="mb-4 text-xl font-black">Contact Information</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div><label className="mb-1 block text-xs font-bold text-gray-600">Email</label><Input type="email" value={cmsContact.email} onChange={e => setCmsContact({ ...cmsContact, email: e.target.value })} placeholder="official.athoo@gmail.com" /></div>
                    <div><label className="mb-1 block text-xs font-bold text-gray-600">Phone</label><Input value={cmsContact.phone} onChange={e => setCmsContact({ ...cmsContact, phone: e.target.value })} placeholder="+92 339 0051068" /></div>
                    <div><label className="mb-1 block text-xs font-bold text-gray-600">WhatsApp Number (digits only)</label><Input value={cmsContact.whatsapp} onChange={e => setCmsContact({ ...cmsContact, whatsapp: e.target.value })} placeholder="923390051068" /></div>
                    <div><label className="mb-1 block text-xs font-bold text-gray-600">Address / Location</label><Input value={cmsContact.address} onChange={e => setCmsContact({ ...cmsContact, address: e.target.value })} placeholder="Pakistan" /></div>
                  </div>
                </div>

                {/* SEO & Social */}
                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-xl font-black">SEO Meta Tags</h2>
                    <div className="grid gap-3">
                      <div><label className="mb-1 block text-xs font-bold text-gray-600">Site Title</label><Input value={cmsSeo.title} onChange={e => setCmsSeo({ ...cmsSeo, title: e.target.value })} placeholder="Athoo — Pakistan Smart Home Services" /></div>
                      <div><label className="mb-1 block text-xs font-bold text-gray-600">Meta Description</label><textarea className="w-full rounded-xl border p-3 text-sm" rows={3} value={cmsSeo.description} onChange={e => setCmsSeo({ ...cmsSeo, description: e.target.value })} placeholder="Athoo connects homeowners with verified service providers..." /></div>
                    </div>
                  </div>
                  <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-xl font-black">Social Links</h2>
                    <div className="grid gap-3">
                      <div><label className="mb-1 block text-xs font-bold text-gray-600">Instagram URL</label><Input value={cmsSocial.instagram} onChange={e => setCmsSocial({ ...cmsSocial, instagram: e.target.value })} placeholder="https://instagram.com/athoo.pk" /></div>
                      <div><label className="mb-1 block text-xs font-bold text-gray-600">Facebook URL</label><Input value={cmsSocial.facebook} onChange={e => setCmsSocial({ ...cmsSocial, facebook: e.target.value })} placeholder="https://facebook.com/athoo.pk" /></div>
                      <div><label className="mb-1 block text-xs font-bold text-gray-600">LinkedIn URL</label><Input value={cmsSocial.linkedin} onChange={e => setCmsSocial({ ...cmsSocial, linkedin: e.target.value })} placeholder="https://linkedin.com/company/athoo" /></div>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="bg-[#0057FF] text-white px-8 py-3"><CheckCircle2 className="mr-2 h-4 w-4" /> Save All CMS Content</Button>
                <p className="text-sm text-gray-400">Note: CMS content is stored in the database. The website reads from <code className="rounded bg-gray-100 px-1">/api/public/cms</code> — connect your React components to this endpoint to make content live.</p>
              </form>
            )}

            {/* ===================== ADMINS ===================== */}
            {activeTab === "admins" && (
              <div className="grid gap-4 xl:grid-cols-[440px_1fr]">
                <form onSubmit={saveAdminUser} className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                  <h2 className="mb-4 text-xl font-black">{adminForm.id ? "Edit Admin" : "Add Admin User"}</h2>
                  <div className="space-y-3">
                    <div><label className="mb-1 block text-xs font-bold text-gray-600">Full Name</label><Input placeholder="Name" value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} required /></div>
                    <div><label className="mb-1 block text-xs font-bold text-gray-600">Email Address</label><Input type="email" placeholder="Email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} required /></div>
                    <div><label className="mb-1 block text-xs font-bold text-gray-600">Password {adminForm.id ? "(leave blank to keep)" : "(min 8 chars)"}</label><Input type="password" placeholder="Password" value={adminForm.password || ""} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} /></div>
                    <div><label className="mb-1 block text-xs font-bold text-gray-600">Role</label>
                      <select className="w-full rounded-xl border px-3 py-2 text-sm" value={adminForm.role} onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}>
                        {ROLES.map(r => <option key={r} value={r}>{prettyRole(r)}</option>)}
                      </select>
                    </div>
                    {adminForm.role === "custom" && (
                      <div className="rounded-2xl bg-gray-50 p-4">
                        <div className="mb-2 text-xs font-bold text-gray-600">Custom Permissions</div>
                        <div className="grid grid-cols-2 gap-2">
                          {PERM_KEYS.map(key => (
                            <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
                              <input type="checkbox" checked={Boolean(adminForm.permissions?.[key])} onChange={e => setAdminForm({ ...adminForm, permissions: { ...(adminForm.permissions || {}), [key]: e.target.checked } })} />
                              {PERM_LABELS[key]}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    <label className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 text-sm font-medium">
                      <input type="checkbox" checked={adminForm.is_active !== false} onChange={(e) => setAdminForm({ ...adminForm, is_active: e.target.checked })} /> Active Account
                    </label>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={!canSettings} className="flex-1 bg-[#0057FF] text-white">{adminForm.id ? "Update Admin" : "Create Admin"}</Button>
                      {adminForm.id && <Button type="button" variant="secondary" onClick={() => setAdminForm({ name: "", email: "", role: "manager", password: "", is_active: true, permissions: {} })}>Cancel</Button>}
                    </div>
                  </div>
                </form>

                <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                  <h2 className="mb-4 text-xl font-black">Admin Users ({admins.length})</h2>
                  <div className="space-y-3">
                    {admins.map(a => (
                      <div key={a.email} className="rounded-2xl border p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-black">{a.name}</div>
                            <div className="text-sm text-gray-500">{a.email}</div>
                            {a.last_login_at && <div className="mt-1 text-xs text-gray-400">Last login: {fmtDate(a.last_login_at)}</div>}
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-2">
                            <div className="flex gap-1.5">
                              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">{prettyRole(a.role)}</span>
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${a.is_active !== false ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{a.is_active !== false ? "Active" : "Disabled"}</span>
                            </div>
                            {canSettings && <div className="flex gap-1">
                              <button onClick={() => setAdminForm({ ...a, password: "" })} className="rounded-lg bg-gray-100 p-1.5 hover:bg-gray-200"><Edit2 className="h-3.5 w-3.5 text-gray-600" /></button>
                              {admin?.role === "super_admin" && a.email !== admin.email && <button onClick={() => deleteAdmin(Number(a.id))} className="rounded-lg bg-red-50 p-1.5 hover:bg-red-100"><Trash2 className="h-3.5 w-3.5 text-red-500" /></button>}
                            </div>}
                          </div>
                        </div>
                        {a.role === "custom" && a.permissions && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {Object.entries(a.permissions).filter(([, v]) => v).map(([k]) => (
                              <span key={k} className="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700">{PERM_LABELS[k] || k}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {!admins.length && <p className="text-gray-400 text-sm">No admin users found.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ===================== SETTINGS ===================== */}
            {activeTab === "settings" && (
              <div className="space-y-4">
                <form onSubmit={saveSettings} className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                  <h2 className="mb-4 text-xl font-black flex items-center gap-2"><Settings className="h-5 w-5 text-[#0057FF]" /> Website Settings</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                        <label className="flex cursor-pointer items-center gap-3 font-bold">
                          <input type="checkbox" checked={maintenance.enabled} onChange={(e) => setMaintenance({ ...maintenance, enabled: e.target.checked })} className="h-5 w-5" />
                          <div><div className="text-orange-800">Maintenance Mode</div><div className="text-sm font-normal text-orange-600">Show maintenance page to all visitors (admins bypass)</div></div>
                        </label>
                      </div>
                    </div>
                    <div className="sm:col-span-2"><label className="mb-1 block text-xs font-bold text-gray-600">Maintenance Message</label><textarea className="w-full rounded-xl border p-3 text-sm" rows={3} value={maintenance.message} onChange={(e) => setMaintenance({ ...maintenance, message: e.target.value })} /></div>
                    <div><label className="mb-1 block text-xs font-bold text-gray-600">Support Email</label><Input type="email" value={maintenance.supportEmail} onChange={(e) => setMaintenance({ ...maintenance, supportEmail: e.target.value })} /></div>
                    <div><label className="mb-1 block text-xs font-bold text-gray-600">Support Phone</label><Input value={maintenance.supportPhone} onChange={(e) => setMaintenance({ ...maintenance, supportPhone: e.target.value })} /></div>
                  </div>
                  <Button type="submit" disabled={!canSettings} className="mt-4 bg-[#0057FF] text-white"><CheckCircle2 className="mr-2 h-4 w-4" /> Save Settings</Button>
                </form>

                <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                  <h2 className="mb-4 text-xl font-black">Admin Credentials Info</h2>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="rounded-2xl bg-blue-50 p-4"><strong>Default login:</strong> Leave email blank and use password: <code className="rounded bg-blue-100 px-1">athoo-admin-change-me</code></div>
                    <div className="rounded-2xl bg-gray-50 p-4"><strong>Change password:</strong> Go to Admins tab → edit the Super Admin → enter a new password.</div>
                    <div className="rounded-2xl bg-gray-50 p-4"><strong>Email keys:</strong> Set <code className="rounded bg-gray-200 px-1">RESEND_API_KEY</code> as an environment secret to enable real email delivery. Without it, emails are logged but not delivered.</div>
                    <div className="rounded-2xl bg-gray-50 p-4"><strong>Notification email:</strong> Set <code className="rounded bg-gray-200 px-1">LEAD_NOTIFY_TO</code> for new form submission alerts. Set <code className="rounded bg-gray-200 px-1">LEAD_EMAIL_FROM</code> for the sender address.</div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== ACTIVITY ===================== */}
            {activeTab === "activity" && (
              <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-black">Audit Log</h2>
                  <Button size="sm" variant="secondary" onClick={loadActivity}><RefreshCw className="mr-1 h-4 w-4" /> Refresh</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500">
                      <tr><th className="p-3">Time</th><th className="p-3">Admin</th><th className="p-3">Action</th><th className="p-3">Target</th><th className="p-3">IP</th></tr>
                    </thead>
                    <tbody>
                      {activity.map((a, i) => (
                        <tr key={i} className="border-t hover:bg-gray-50">
                          <td className="p-3 text-xs text-gray-400 whitespace-nowrap">{fmtDate(a.created_at)}</td>
                          <td className="p-3 text-xs font-medium text-blue-600">{a.admin_email || "—"}</td>
                          <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${a.action.includes("login") ? "bg-green-50 text-green-700" : a.action.includes("delete") ? "bg-red-50 text-red-600" : a.action.includes("email") ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-700"}`}>{prettyAction(a.action)}</span></td>
                          <td className="p-3 text-xs text-gray-500">{a.target_type || ""} {a.target_id ? `#${a.target_id}` : ""}</td>
                          <td className="p-3 text-xs text-gray-400">{a.ip_address || "—"}</td>
                        </tr>
                      ))}
                      {!activity.length && <tr><td colSpan={5} className="p-8 text-center text-gray-400">No audit log entries yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </section>
        </div>
      </main>
    </>
  );
}
