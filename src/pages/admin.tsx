import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Bell, Download, Lock, LogOut, Mail, RefreshCw, Search, ShieldCheck, SlidersHorizontal,
  UserCog, Users, Wrench, BarChart3, CheckCircle2, AlertTriangle, Send, Plus, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const roles = ["super_admin", "admin", "manager", "custom"];
const statuses = ["new", "contacted", "approved", "rejected", "closed"];
const priorities = ["normal", "high", "urgent"];

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

function authHeaders(token: string) { return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }; }
function prettyRole(role: string) { return role.replace("_", " ").replace(/\b\w/g, (m) => m.toUpperCase()); }

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem("athoo_admin_token") || "");
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    try { return JSON.parse(localStorage.getItem("athoo_admin_user") || "null"); } catch { return null; }
  });
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState<"leads" | "email" | "admins" | "settings" | "activity">("leads");
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
  const [emailDraft, setEmailDraft] = useState({ subject: "Athoo Launch Update", message: "Hi {{name}},\n\nThank you for joining Athoo. We have received your request and our team will contact you soon.\n\nRegards,\nAthoo Team" });
  const [adminForm, setAdminForm] = useState<AdminUser & { password?: string }>({ name: "", email: "", role: "manager", password: "", is_active: true });
  const [maintenance, setMaintenance] = useState({ enabled: false, message: "Athoo website is under maintenance. Please check back soon.", supportEmail: "official.athoo@gmail.com", supportPhone: "+92 339 0051068" });

  const selectedLeads = useMemo(() => leads.filter((l) => selected.includes(l.id)), [leads, selected]);
  const canManage = admin?.role === "super_admin" || admin?.role === "admin" || admin?.permissions?.all || admin?.permissions?.manage_leads;
  const canSettings = admin?.role === "super_admin" || admin?.role === "admin" || admin?.permissions?.all || admin?.permissions?.manage_settings;

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
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    return params.toString();
  }

  async function loadLeads() {
    if (!token) return; setLoading(true); setError("");
    try {
      const response = await fetch(`/api/admin/leads?${queryString()}`, { headers: { Authorization: `Bearer ${token}` } });
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
      const response = await fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json(); if (!response.ok) return;
      setSettings(data.settings || {});
      setMaintenance({
        enabled: Boolean(data.settings?.maintenance_mode?.enabled),
        message: data.settings?.maintenance_mode?.message || "Athoo website is under maintenance. Please check back soon.",
        supportEmail: data.settings?.support_email || "official.athoo@gmail.com",
        supportPhone: data.settings?.support_phone || "+92 339 0051068",
      });
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

  function logout() { localStorage.removeItem("athoo_admin_token"); localStorage.removeItem("athoo_admin_user"); setToken(""); setAdmin(null); setLeads([]); }

  function exportCsv() {
    const params = new URLSearchParams(queryString());
    fetch(`/api/admin/export?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob()).then((blob) => { const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "athoo-filtered-leads.csv"; link.click(); });
  }

  async function updateLeads(patch: Record<string, unknown>, ids = selected) {
    if (!ids.length) return setError("Select at least one lead first.");
    setLoading(true); setError(""); setNotice("");
    try {
      const r = await fetch("/api/admin/lead-update", { method: "POST", headers: authHeaders(token), body: JSON.stringify({ ids, ...patch }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Update failed");
      setNotice("Lead updated successfully."); setSelected([]); await loadLeads();
    } catch (err) { setError(err instanceof Error ? err.message : "Update failed"); }
    finally { setLoading(false); }
  }

  async function sendBulkEmail() {
    const ids = selected.length ? selected : selectedLeads.map((l) => l.id);
    if (!ids.length) return setError("Select leads first.");
    setLoading(true); setError(""); setNotice("");
    try {
      const r = await fetch("/api/admin/bulk-email", { method: "POST", headers: authHeaders(token), body: JSON.stringify({ ids, ...emailDraft }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Email failed");
      setNotice(d.note || `Email action complete. Sent: ${d.sent}, skipped: ${d.skipped}`); await loadLeads();
    } catch (err) { setError(err instanceof Error ? err.message : "Email failed"); }
    finally { setLoading(false); }
  }

  async function saveAdminUser(e: React.FormEvent) {
    e.preventDefault(); setError(""); setNotice("");
    try {
      const r = await fetch("/api/admin/admins", { method: "POST", headers: authHeaders(token), body: JSON.stringify(adminForm) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Could not save admin");
      setNotice("Admin user saved."); setAdminForm({ name: "", email: "", role: "manager", password: "", is_active: true }); await loadAdmins();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save admin"); }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault(); setError(""); setNotice("");
    try {
      const r = await fetch("/api/admin/settings", { method: "POST", headers: authHeaders(token), body: JSON.stringify({ maintenanceEnabled: maintenance.enabled, maintenanceMessage: maintenance.message, supportEmail: maintenance.supportEmail, supportPhone: maintenance.supportPhone }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Could not save settings");
      setNotice("Settings saved."); await loadSettings();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save settings"); }
  }

  useEffect(() => { if (token) { loadLeads(); loadSettings(); } }, [token]);
  useEffect(() => { if (activeTab === "admins") loadAdmins(); if (activeTab === "activity") loadActivity(); }, [activeTab]);

  if (!token) return (
    <><Helmet><title>Athoo Admin Login</title></Helmet>
      <main className="min-h-screen bg-[#081120] px-4 py-10 text-white sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
          <div className="hidden lg:block">
            <img src="/athoo-logo.png" alt="Athoo" className="mb-8 h-20 w-20 rounded-3xl bg-white p-2 shadow-2xl" />
            <h1 className="text-5xl font-black leading-tight">Athoo Professional Admin</h1>
            <p className="mt-5 max-w-xl text-lg text-gray-300">Manage leads, providers, waitlist requests, filtered exports, admin roles, maintenance mode and email communications from one secure dashboard.</p>
          </div>
          <div className="rounded-[2rem] bg-white p-6 text-gray-900 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600"><Lock /></div><div><h1 className="text-2xl font-black">Athoo Admin</h1><p className="text-sm text-gray-500">Secure dashboard login</p></div></div>
            <form onSubmit={login} className="space-y-4">
              <Input type="email" placeholder="Admin email optional" value={email} onChange={(e) => setEmail(e.target.value)} className="min-h-12" />
              <Input type="password" placeholder="Admin password" value={password} onChange={(e) => setPassword(e.target.value)} className="min-h-12" />
              {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
              <Button className="min-h-12 w-full rounded-xl bg-[#0057FF]" disabled={loading}>{loading ? "Checking..." : "Login"}</Button>
            </form>
          </div>
        </div>
      </main>
    </>
  );

  return (
    <><Helmet><title>Athoo Admin Dashboard</title></Helmet>
      <main className="min-h-screen bg-[#f5f7fb] text-gray-900">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 p-3 sm:p-5 lg:flex-row">
          <aside className="rounded-[1.75rem] bg-[#081120] p-4 text-white shadow-xl lg:sticky lg:top-5 lg:h-[calc(100vh-40px)] lg:w-72">
            <div className="mb-6 flex items-center gap-3"><img src="/athoo-logo.png" alt="Athoo" className="h-12 w-12 rounded-2xl bg-white p-1" /><div><div className="text-xl font-black">Athoo</div><div className="text-xs uppercase tracking-widest text-blue-200">Admin Panel</div></div></div>
            <div className="mb-5 rounded-2xl bg-white/10 p-3 text-sm"><div className="font-bold">{admin?.name || "Admin"}</div><div className="truncate text-gray-300">{admin?.email}</div><div className="mt-2 inline-flex rounded-full bg-orange-500 px-3 py-1 text-xs font-bold">{prettyRole(admin?.role || "admin")}</div></div>
            <nav className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              {[
                ["leads", Users, "Leads CRM"], ["email", Mail, "Bulk Email"], ["admins", UserCog, "Admins"], ["settings", Wrench, "Settings"], ["activity", BarChart3, "Activity"],
              ].map(([tab, Icon, label]: any) => <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${activeTab === tab ? "bg-white text-[#0057FF]" : "bg-white/5 text-gray-300 hover:bg-white/10"}`}><Icon className="h-4 w-4" /> {label}</button>)}
              <button onClick={logout} className="flex items-center gap-3 rounded-2xl bg-red-500/20 px-4 py-3 text-left text-sm font-bold text-red-100 hover:bg-red-500/30"><LogOut className="h-4 w-4" /> Logout</button>
            </nav>
          </aside>

          <section className="min-w-0 flex-1">
            <div className="mb-5 rounded-[1.75rem] bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                <div><h1 className="text-2xl font-black sm:text-4xl">Professional Admin Dashboard</h1><p className="mt-1 text-sm text-gray-500">CRM, filtered export, email, roles, logs and website controls.</p></div>
                <div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={loadLeads}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button><Button onClick={exportCsv} className="bg-[#0057FF]"><Download className="mr-2 h-4 w-4" /> Export Filtered CSV</Button></div>
              </div>
            </div>

            {error && <div className="mb-4 rounded-2xl bg-red-50 p-4 font-semibold text-red-600"><AlertTriangle className="mr-2 inline h-4 w-4" />{error}</div>}
            {notice && <div className="mb-4 rounded-2xl bg-green-50 p-4 font-semibold text-green-700"><CheckCircle2 className="mr-2 inline h-4 w-4" />{notice}</div>}

            {activeTab === "leads" && <>
              <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                {[ ["Total", stats.total, Users], ["Today", stats.today, Bell], ["New", stats.new_leads, AlertTriangle], ["Providers", stats.providers, ShieldCheck], ["Waitlist", stats.waitlist, CheckCircle2], ["Contact", stats.contacts, Mail] ].map(([label, value, Icon]: any) => <div key={label} className="rounded-3xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><Icon className="mb-4 h-6 w-6 text-[#0057FF]" /><div className="text-3xl font-black">{value || 0}</div><div className="text-sm font-semibold text-gray-500">{label}</div></div>)}
              </div>

              <div className="mb-5 rounded-[1.75rem] bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2 font-black"><SlidersHorizontal className="h-5 w-5 text-[#0057FF]" /> Filters</div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="relative"><Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" /><Input className="min-h-12 pl-10" placeholder="Search name, email, phone..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></div>
                  <select className="min-h-12 rounded-xl border px-3" value={filters.formType} onChange={(e) => setFilters({ ...filters, formType: e.target.value })}><option value="">All forms</option><option>Contact Form</option><option>Waitlist Signup</option><option>Provider Waitlist</option></select>
                  <select className="min-h-12 rounded-xl border px-3" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">All status</option>{statuses.map(s => <option key={s}>{s}</option>)}</select>
                  <select className="min-h-12 rounded-xl border px-3" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}><option value="">All priority</option>{priorities.map(s => <option key={s}>{s}</option>)}</select>
                  <Input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} />
                  <Input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} />
                  <select className="min-h-12 rounded-xl border px-3" value={filters.assignedTo} onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}><option value="">All assigned</option>{admins.map(a => <option key={a.email} value={a.email}>{a.name}</option>)}</select>
                  <Button className="min-h-12 bg-[#FF8A00]" onClick={loadLeads} disabled={loading}>{loading ? "Loading..." : "Apply Filters"}</Button>
                </div>
              </div>

              {selected.length > 0 && <div className="mb-5 rounded-3xl bg-[#081120] p-4 text-white"><div className="mb-3 font-bold">{selected.length} selected</div><div className="flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={() => updateLeads({ status: "contacted" })}>Mark Contacted</Button><Button size="sm" variant="secondary" onClick={() => updateLeads({ status: "approved" })}>Approve</Button><Button size="sm" variant="secondary" onClick={() => updateLeads({ priority: "urgent" })}>Urgent</Button><Button size="sm" variant="secondary" onClick={() => setActiveTab("email")}>Email Selected</Button></div></div>}

              <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1150px] text-left text-sm"><thead className="bg-gray-100 text-gray-700"><tr><th className="p-4"><input type="checkbox" onChange={(e) => setSelected(e.target.checked ? leads.map(l => l.id) : [])} checked={leads.length > 0 && selected.length === leads.length} /></th><th className="p-4">Date</th><th className="p-4">Form</th><th className="p-4">Name</th><th className="p-4">Contact</th><th className="p-4">Service/City</th><th className="p-4">Message</th><th className="p-4">Status</th><th className="p-4">Priority</th><th className="p-4">Assigned</th></tr></thead>
                    <tbody>{leads.map((lead) => <tr key={lead.id} className="border-t align-top hover:bg-blue-50/40"><td className="p-4"><input type="checkbox" checked={selected.includes(lead.id)} onChange={(e) => setSelected(e.target.checked ? [...selected, lead.id] : selected.filter(id => id !== lead.id))} /></td><td className="p-4 text-gray-500">{new Date(lead.created_at).toLocaleString()}</td><td className="p-4 font-semibold">{lead.form_type}</td><td className="p-4">{lead.name || "—"}</td><td className="p-4"><div>{lead.email || "—"}</div><div className="text-gray-500">{lead.phone || ""}</div></td><td className="p-4"><div>{lead.service || "—"}</div><div className="text-gray-500">{lead.city || ""}</div></td><td className="max-w-md p-4"><div className="line-clamp-3">{lead.message || lead.subject || lead.experience || "—"}</div>{lead.admin_notes && <div className="mt-2 rounded-xl bg-yellow-50 p-2 text-xs text-yellow-800">{lead.admin_notes}</div>}</td><td className="p-4"><select className="rounded-xl border px-2 py-1" value={lead.status} disabled={!canManage} onChange={(e) => updateLeads({ status: e.target.value }, [lead.id])}>{statuses.map(s => <option key={s}>{s}</option>)}</select></td><td className="p-4"><select className="rounded-xl border px-2 py-1" value={lead.priority || "normal"} disabled={!canManage} onChange={(e) => updateLeads({ priority: e.target.value }, [lead.id])}>{priorities.map(s => <option key={s}>{s}</option>)}</select></td><td className="p-4"><select className="rounded-xl border px-2 py-1" value={lead.assigned_to || ""} disabled={!canManage} onChange={(e) => updateLeads({ assignedTo: e.target.value }, [lead.id])}><option value="">Unassigned</option>{admins.map(a => <option key={a.email} value={a.email}>{a.name}</option>)}</select></td></tr>)}{!leads.length && <tr><td colSpan={10} className="p-8 text-center text-gray-500">No leads found.</td></tr>}</tbody></table>
                </div>
              </div>
            </>}

            {activeTab === "email" && <div className="grid gap-5 xl:grid-cols-[1fr_360px]"><div className="rounded-[1.75rem] bg-white p-5 shadow-sm"><h2 className="mb-2 text-2xl font-black">Bulk / Optional Email</h2><p className="mb-5 text-sm text-gray-500">Select leads from CRM first. Works with Resend when RESEND_API_KEY is configured. Without it, emails are logged but not sent.</p><Input className="mb-3 min-h-12" value={emailDraft.subject} onChange={(e) => setEmailDraft({ ...emailDraft, subject: e.target.value })} placeholder="Subject" /><textarea className="min-h-[260px] w-full rounded-xl border p-4" value={emailDraft.message} onChange={(e) => setEmailDraft({ ...emailDraft, message: e.target.value })} /><div className="mt-4 flex flex-wrap gap-2"><Button className="bg-[#0057FF]" onClick={sendBulkEmail}><Send className="mr-2 h-4 w-4" /> Send to Selected</Button><Button variant="secondary" onClick={() => setEmailDraft({ subject: "Athoo Provider Onboarding Update", message: "Hi {{name}},\n\nThank you for joining Athoo as a provider. Our onboarding team will contact you soon for document verification and service details.\n\nRegards,\nAthoo Team" })}>Provider Template</Button></div></div><div className="rounded-[1.75rem] bg-white p-5 shadow-sm"><h3 className="mb-3 font-black">Selected Recipients</h3>{selectedLeads.length ? selectedLeads.map(l => <div key={l.id} className="mb-2 rounded-2xl bg-gray-50 p-3 text-sm"><b>{l.name || "No name"}</b><br />{l.email || "No email"}</div>) : <p className="text-sm text-gray-500">No selected leads.</p>}</div></div>}

            {activeTab === "admins" && <div className="grid gap-5 xl:grid-cols-[420px_1fr]"><form onSubmit={saveAdminUser} className="rounded-[1.75rem] bg-white p-5 shadow-sm"><h2 className="mb-4 text-2xl font-black"><Plus className="mr-2 inline h-5 w-5" />Add Admin</h2><Input className="mb-3" placeholder="Name" value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} /><Input className="mb-3" placeholder="Email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} /><Input className="mb-3" placeholder="Password" type="password" value={adminForm.password || ""} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} /><select className="mb-3 min-h-12 w-full rounded-xl border px-3" value={adminForm.role} onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}>{roles.map(r => <option key={r} value={r}>{prettyRole(r)}</option>)}</select><Button disabled={!canSettings} className="w-full bg-[#0057FF]">Save Admin</Button></form><div className="rounded-[1.75rem] bg-white p-5 shadow-sm"><h2 className="mb-4 text-2xl font-black">Admin Users</h2><div className="grid gap-3">{admins.map(a => <div key={a.email} className="rounded-2xl border p-4"><div className="font-black">{a.name}</div><div className="text-sm text-gray-500">{a.email}</div><div className="mt-2 flex gap-2"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{prettyRole(a.role)}</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${a.is_active !== false ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{a.is_active !== false ? "Active" : "Disabled"}</span></div></div>)}</div></div></div>}

            {activeTab === "settings" && <form onSubmit={saveSettings} className="rounded-[1.75rem] bg-white p-5 shadow-sm"><h2 className="mb-4 text-2xl font-black">Website Settings</h2><label className="mb-4 flex items-center gap-3 rounded-2xl bg-gray-50 p-4 font-bold"><input type="checkbox" checked={maintenance.enabled} onChange={(e) => setMaintenance({ ...maintenance, enabled: e.target.checked })} /> Maintenance Mode</label><textarea className="mb-3 min-h-[120px] w-full rounded-xl border p-4" value={maintenance.message} onChange={(e) => setMaintenance({ ...maintenance, message: e.target.value })} /><Input className="mb-3" placeholder="Support email" value={maintenance.supportEmail} onChange={(e) => setMaintenance({ ...maintenance, supportEmail: e.target.value })} /><Input className="mb-3" placeholder="Support phone" value={maintenance.supportPhone} onChange={(e) => setMaintenance({ ...maintenance, supportPhone: e.target.value })} /><Button disabled={!canSettings} className="bg-[#0057FF]">Save Settings</Button><p className="mt-4 text-sm text-gray-500">Note: maintenance mode is stored and ready for your website/app to read. It does not hide pages automatically until middleware is connected.</p></form>}

            {activeTab === "activity" && <div className="rounded-[1.75rem] bg-white p-5 shadow-sm"><h2 className="mb-4 text-2xl font-black">Admin Activity Logs</h2><div className="grid gap-3">{activity.map((a, i) => <div key={i} className="rounded-2xl border p-4 text-sm"><div className="font-black">{a.action}</div><div className="text-gray-500">{a.admin_email} • {new Date(a.created_at).toLocaleString()} • {a.ip_address}</div><div className="text-gray-400">{a.target_type} {a.target_id}</div></div>)}{!activity.length && <p className="text-gray-500">No activity yet.</p>}</div></div>}
          </section>
        </div>
      </main>
    </>
  );
}
