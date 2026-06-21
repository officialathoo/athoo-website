import { PRIMARY_API_BASE, normalizeApiBase } from "@/lib/apiBase";

function resolveApiBases(): string[] {
  const configured = normalizeApiBase(import.meta.env.VITE_API_BASE_URL || "");
  return Array.from(new Set([PRIMARY_API_BASE, configured].map(normalizeApiBase).filter(Boolean)));
}

const API_BASES = resolveApiBases();

export type AthooFormType =
  | "Contact Form"
  | "Waitlist Signup"
  | "Provider Waitlist";

export type SubmissionPayload = Record<
  string,
  string | number | boolean | undefined | null
>;

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
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function postToApi(
  apiBase: string,
  formType: AthooFormType,
  payload: Record<string, string>,
) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 25_000);

  try {
    const response = await fetch(`${apiBase}/api/submit`, {
      method: "POST",
      mode: "cors",
      cache: "no-store",
      credentials: "omit",
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

    // Lead saved = success. Email may be sent, failed, or skipped, but the user
    // should not see an error if the backend has accepted the lead.
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
        `Submission failed (${response.status})`,
    );
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function submitToAthooEmail(
  formType: AthooFormType,
  payload: SubmissionPayload,
) {
  const cleanPayload = clean(payload);
  let lastError: unknown = null;

  for (const apiBase of API_BASES) {
    try {
      return await postToApi(apiBase, formType, cleanPayload);
    } catch (error) {
      lastError = error;
    }
  }

  if (isAbortError(lastError)) {
    throw new Error("Submission is taking too long. Please try again.");
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error("Could not submit online");
}
