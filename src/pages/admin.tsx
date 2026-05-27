import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Download, Lock, LogOut, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Lead = {
  id: number;
  form_type: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  subject?: string | null;
  message?: string | null;
  service?: string | null;
  city?: string | null;
  experience?: string | null;
  source?: string | null;
  status: string;
  created_at: string;
};

type CountRow = { status: string; count: number };

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem("athoo_admin_token") || "");
  const [password, setPassword] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [counts, setCounts] = useState<CountRow[]>([]);
  const [search, setSearch] = useState("");
  const [formType, setFormType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = useMemo(() => counts.reduce((sum, row) => sum + Number(row.count || 0), 0), [counts]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("athoo_admin_token", data.token);
      setToken(data.token);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function loadLeads() {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (formType) params.set("formType", formType);
      const response = await fetch(`/api/admin/leads?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.status === 401) {
        localStorage.removeItem("athoo_admin_token");
        setToken("");
        throw new Error("Session expired. Please login again.");
      }
      if (!response.ok) throw new Error(data.error || "Could not load leads");
      setLeads(data.rows || []);
      setCounts(data.counts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load leads");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("athoo_admin_token");
    setToken("");
    setLeads([]);
  }

  function exportCsv() {
    const link = document.createElement("a");
    link.href = `/api/admin/export?token=${encodeURIComponent(token)}`;
    fetch("/api/admin/export", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        link.href = URL.createObjectURL(blob);
        link.download = "athoo-website-leads.csv";
        link.click();
      });
  }

  useEffect(() => {
    loadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return (
      <>
        <Helmet><title>Athoo Admin Login</title></Helmet>
        <main className="min-h-screen bg-[#081120] px-6 py-16 text-white">
          <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-gray-900 shadow-2xl">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600"><Lock /></div>
            <h1 className="mb-2 text-3xl font-black">Athoo Admin</h1>
            <p className="mb-8 text-gray-500">Login to view website form submissions and provider waitlist leads.</p>
            <form onSubmit={login} className="space-y-4">
              <Input type="password" placeholder="Admin password" value={password} onChange={(e) => setPassword(e.target.value)} className="min-h-12" />
              {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
              <Button className="min-h-12 w-full" disabled={loading}>{loading ? "Checking..." : "Login"}</Button>
            </form>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Athoo Admin Dashboard</title></Helmet>
      <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 rounded-3xl bg-[#081120] p-6 text-white md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-black">Athoo Website Leads</h1>
              <p className="text-gray-300">Total leads: {total || leads.length}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={loadLeads}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
              <Button variant="secondary" onClick={exportCsv}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
              <Button variant="destructive" onClick={logout}><LogOut className="mr-2 h-4 w-4" /> Logout</Button>
            </div>
          </div>

          <div className="mb-6 grid gap-4 rounded-3xl bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input className="min-h-12 pl-10" placeholder="Search name, email, phone, city, service..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="min-h-12 rounded-md border px-3" value={formType} onChange={(e) => setFormType(e.target.value)}>
              <option value="">All forms</option>
              <option value="Contact Form">Contact Form</option>
              <option value="Waitlist Signup">Waitlist Signup</option>
              <option value="Provider Waitlist">Provider Waitlist</option>
            </select>
            <Button className="min-h-12" onClick={loadLeads} disabled={loading}>{loading ? "Loading..." : "Apply"}</Button>
          </div>

          {error && <p className="mb-4 rounded-xl bg-red-50 p-4 text-red-600">{error}</p>}

          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-4">Date</th><th className="p-4">Form</th><th className="p-4">Name</th><th className="p-4">Contact</th><th className="p-4">Service/City</th><th className="p-4">Message</th><th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-t align-top">
                      <td className="p-4 text-gray-500">{new Date(lead.created_at).toLocaleString()}</td>
                      <td className="p-4 font-semibold">{lead.form_type}</td>
                      <td className="p-4">{lead.name || "—"}</td>
                      <td className="p-4"><div>{lead.email || "—"}</div><div className="text-gray-500">{lead.phone || ""}</div></td>
                      <td className="p-4"><div>{lead.service || "—"}</div><div className="text-gray-500">{lead.city || ""}</div></td>
                      <td className="max-w-md p-4"><div className="line-clamp-4">{lead.message || lead.subject || lead.experience || "—"}</div></td>
                      <td className="p-4"><span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">{lead.status}</span></td>
                    </tr>
                  ))}
                  {!leads.length && <tr><td colSpan={7} className="p-8 text-center text-gray-500">No leads found yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
