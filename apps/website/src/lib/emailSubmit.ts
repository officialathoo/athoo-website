function resolveApiBase(): string {
  const configured = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  if (configured) return configured;

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "athoo.pk" || host === "www.athoo.pk" || host === "admin.athoo.pk") {
      return "https://api.athoo.pk";
    }
  }

  return "";
}

const API_BASE = resolveApiBase();

export type SubmissionPayload = Record<string, string | number | undefined | null>;

function clean(payload: SubmissionPayload): Record<string, string> {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      key,
      String(value ?? "").replace(/[<>]/g, "").trim(),
    ]),
  );
}

async function tryApi(formType: string, payload: Record<string, string>) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_BASE}/api/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        formType,
        source: typeof window !== "undefined" ? window.location.href : "Athoo Website",
        submittedAt: new Date().toISOString(),
        ...payload,
      }),
    });

    const data = await response.json().catch(() => ({ ok: false }));

    if (!response.ok || data.ok === false) {
      throw new Error(data.error || data.errors?.join(", ") || "Submission failed");
    }

    return data;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Submission is taking too long. Please try again.");
    }

    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function submitToAthooEmail(
  formType: string,
  payload: SubmissionPayload,
) {
  const cleanPayload = clean(payload);
  return tryApi(formType, cleanPayload);
}