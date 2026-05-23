export type SubmissionPayload = Record<string, string | number | undefined | null>;

const ATHOO_EMAIL = "official.athoo@gmail.com";

function clean(payload: SubmissionPayload) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [key, String(value ?? "").trim()]),
  );
}

function mailtoFallback(formType: string, payload: Record<string, string>) {
  const subject = encodeURIComponent(`Athoo Website ${formType}`);
  const body = encodeURIComponent(
    [`Form Type: ${formType}`, `Page: ${window.location.href}`, `Submitted: ${new Date().toLocaleString()}`, "", ...Object.entries(payload).map(([k, v]) => `${k}: ${v}`)].join("\n"),
  );
  window.location.href = `mailto:${ATHOO_EMAIL}?subject=${subject}&body=${body}`;
}

export async function submitToAthooEmail(formType: string, payload: SubmissionPayload) {
  const cleanPayload = clean(payload);

  const response = await fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      formType,
      source: typeof window !== "undefined" ? window.location.href : "Athoo Website",
      submittedAt: new Date().toLocaleString(),
      ...cleanPayload,
    }),
  });

  if (response.ok) return response.json().catch(() => ({ ok: true }));

  // Safe fallback so users can still send the message even if email service is not configured.
  if (typeof window !== "undefined") mailtoFallback(formType, cleanPayload);
  throw new Error("Email submission failed");
}
