function resolveApiBase(): string {
  const configured = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

  if (configured) {
    return configured;
  }

  return "https://thoo-api.onrender.com";
}

const API_BASE = resolveApiBase();

export type SubmissionPayload = Record<
  string,
  string | number | boolean | undefined | null
>;

export type AthooFormType =
  | "Contact Form"
  | "Waitlist Signup"
  | "Provider Waitlist";

function clean(payload: SubmissionPayload): Record<string, string> {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      key,
      String(value ?? "")
        .replace(/[<>]/g, "")
        .replace(/[\u0000-\u001F\u007F]/g, " ")
        .trim(),
    ]),
  );
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

async function parseResponse(response: Response): Promise<any> {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function tryApi(
  formType: AthooFormType,
  payload: Record<string, string>,
) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20000);

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
        source:
          typeof window !== "undefined"
            ? window.location.href
            : "Athoo Website",
        submittedAt: new Date().toISOString(),
        ...payload,
      }),
    });

    const data = await parseResponse(response);

    if (response.ok && (data?.ok === true || data?.id)) {
      return {
        ok: true,
        id: data?.id,
        emailStatus: data?.emailStatus || "unknown",
      };
    }

    throw new Error(
      data?.error ||
      data?.errors?.join?.(", ") ||
      data?.raw ||
      "Submission failed",
    );
  } catch (error) {
    if (isAbortError(error)) {
      throw new Error("Submission is taking too long. Please try again.");
    }

    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function submitToAthooEmail(
  formType: AthooFormType,
  payload: SubmissionPayload,
) {
  const cleanPayload = clean(payload);
  return tryApi(formType, cleanPayload);
}