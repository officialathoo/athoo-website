export type SubmissionPayload = Record<string, string | number | undefined | null>;

const ATHOO_EMAIL = "official.athoo@gmail.com";

function clean(payload: SubmissionPayload) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [key, String(value ?? "").replace(/[<>]/g, "").trim()]),
  );
}

function buildMessage(formType: string, payload: Record<string, string>) {
  return [
    `Form Type: ${formType}`,
    `Page: ${typeof window !== "undefined" ? window.location.href : "Athoo Website"}`,
    `Submitted: ${new Date().toLocaleString()}`,
    "",
    ...Object.entries(payload).map(([k, v]) => `${k}: ${v}`),
  ].join("\n");
}

function openMailFallback(formType: string, payload: Record<string, string>) {
  const subject = encodeURIComponent(`Athoo Website ${formType}`);
  const body = encodeURIComponent(buildMessage(formType, payload));
  window.location.href = `mailto:${ATHOO_EMAIL}?subject=${subject}&body=${body}`;
}

async function tryApi(formType: string, payload: Record<string, string>) {
  const response = await fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      formType,
      source: typeof window !== "undefined" ? window.location.href : "Athoo Website",
      submittedAt: new Date().toLocaleString(),
      ...payload,
    }),
  });
  if (!response.ok) throw new Error("API failed");
  return response.json().catch(() => ({ ok: true }));
}

async function tryFormSubmit(formType: string, payload: Record<string, string>) {
  const fd = new FormData();
  fd.append("_subject", `Athoo Website ${formType}`);
  fd.append("_template", "table");
  fd.append("_captcha", "false");
  fd.append("formType", formType);
  fd.append("source", typeof window !== "undefined" ? window.location.href : "Athoo Website");
  fd.append("submittedAt", new Date().toLocaleString());
  Object.entries(payload).forEach(([key, value]) => fd.append(key, value));

  const response = await fetch(`https://formsubmit.co/ajax/${ATHOO_EMAIL}`, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: fd,
  });
  if (!response.ok) throw new Error("FormSubmit failed");
  return response.json().catch(() => ({ ok: true }));
}

export async function submitToAthooEmail(formType: string, payload: SubmissionPayload) {
  const cleanPayload = clean(payload);

  try {
    return await tryApi(formType, cleanPayload);
  } catch {
    // Continue to fallback.
  }

  try {
    return await tryFormSubmit(formType, cleanPayload);
  } catch {
    // Last-resort fallback still lets the visitor send the message from their device.
    if (typeof window !== "undefined") openMailFallback(formType, cleanPayload);
    return { ok: true, sentBy: "mailto-fallback" };
  }
}
