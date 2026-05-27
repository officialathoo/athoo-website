export type SubmissionPayload = Record<string, string | number | undefined | null>;

function clean(payload: SubmissionPayload) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [key, String(value ?? "").replace(/[<>]/g, "").trim()]),
  );
}

async function tryApi(formType: string, payload: Record<string, string>) {
  const response = await fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
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
}

export async function submitToAthooEmail(formType: string, payload: SubmissionPayload) {
  const cleanPayload = clean(payload);
  return tryApi(formType, cleanPayload);
}
