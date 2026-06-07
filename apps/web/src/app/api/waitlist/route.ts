import { NextResponse } from "next/server";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type WaitlistError =
  | "invalid_email"
  | "missing_config"
  | "upstream_error"
  | "bad_request";

function fail(error: WaitlistError, status: number, detail?: string) {
  return NextResponse.json({ ok: false, error, detail }, { status });
}

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    return fail("missing_config", 500);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("bad_request", 400, "Body must be JSON");
  }

  const email =
    typeof body === "object" && body !== null && "email" in body
      ? String((body as { email: unknown }).email).trim().toLowerCase()
      : "";

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return fail("invalid_email", 400);
  }

  const res = await fetch(
    `https://api.resend.com/audiences/${audienceId}/contacts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    }
  );

  if (res.ok) {
    return NextResponse.json({ ok: true });
  }

  // Resend returns 422 for "contact_already_exists" — treat as success for UX.
  // Any contact already in the audience is on the list; that's the desired state.
  if (res.status === 422) {
    return NextResponse.json({ ok: true, alreadySubscribed: true });
  }

  return fail("upstream_error", 502, `Resend responded ${res.status}`);
}
