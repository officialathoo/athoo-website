import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";

type SubmissionPayload = {
  type: "Contact" | "Waitlist" | "Provider Interest";
  data: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
};

const FALLBACK_DIR = path.resolve(process.cwd(), "data");
const FALLBACK_FILE = path.join(FALLBACK_DIR, "website-submissions.jsonl");

function esc(value: unknown): string {
  return String(value ?? "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] || c));
}

function buildHtml(payload: SubmissionPayload): string {
  const rows = Object.entries(payload.data)
    .map(([key, value]) => `<tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">${esc(key)}</td><td style="padding:8px;border:1px solid #e5e7eb">${esc(value)}</td></tr>`)
    .join("");
  return `
    <div style="font-family:Arial,sans-serif;color:#081120">
      <h2>Athoo Website Submission: ${esc(payload.type)}</h2>
      <p><strong>Date:</strong> ${new Date().toISOString()}</p>
      <p><strong>IP:</strong> ${esc(payload.ip || "unknown")}</p>
      <p><strong>User Agent:</strong> ${esc(payload.userAgent || "unknown")}</p>
      <table style="border-collapse:collapse;width:100%;max-width:720px">${rows}</table>
    </div>`;
}

async function sendViaResend(payload: SubmissionPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const to = process.env.EMAIL_TO || "official.athoo@gmail.com";
  const from = process.env.EMAIL_FROM || "Athoo Website <onboarding@resend.dev>";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject: `Athoo Website - ${payload.type}`, html: buildHtml(payload) }),
  });
  if (!response.ok) throw new Error(`Resend failed with ${response.status}: ${await response.text()}`);
  return true;
}

export async function saveFallback(payload: SubmissionPayload) {
  await mkdir(FALLBACK_DIR, { recursive: true });
  await appendFile(FALLBACK_FILE, JSON.stringify({ ...payload, createdAt: new Date().toISOString() }) + "\n", "utf8");
}

export async function notifyAthoo(payload: SubmissionPayload) {
  try {
    const sent = await sendViaResend(payload);
    if (!sent) await saveFallback(payload);
    return { emailed: sent, fallbackSaved: !sent };
  } catch (error) {
    await saveFallback({ ...payload, data: { ...payload.data, emailError: error instanceof Error ? error.message : String(error) } });
    return { emailed: false, fallbackSaved: true };
  }
}

export function getRequestMeta(req: any) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwarded) ? forwarded[0] : typeof forwarded === "string" ? forwarded.split(",")[0].trim() : req.socket.remoteAddress || "unknown";
  const userAgent = typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : "unknown";
  return { ip, userAgent };
}
