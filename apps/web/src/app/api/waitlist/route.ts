import { NextResponse, after } from "next/server";
import { buildWelcomeEmail } from "@/lib/emails/welcome";

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

async function existsInAudience(opts: {
  apiKey: string;
  audienceId: string;
  email: string;
}): Promise<boolean | undefined> {
  // Resend allows looking up a contact by email at /audiences/{id}/contacts/{email}.
  // Returns 200 if present, 404 if not. Anything else is treated as "unknown"
  // so we fall back to the additive POST.
  const res = await fetch(
    `https://api.resend.com/audiences/${opts.audienceId}/contacts/${encodeURIComponent(
      opts.email
    )}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${opts.apiKey}` },
    }
  );
  if (res.status === 200) return true;
  if (res.status === 404) return false;
  return undefined;
}

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const replyTo = process.env.RESEND_REPLY_TO;

  if (!apiKey || !audienceId) {
    return fail("missing_config", 500);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("bad_request", 400, "Body must be JSON");
  }

  // Strict: email must be a string. Arrays and other types get rejected
  // before any coercion happens, so ["a@b.com"] no longer leaks through.
  const rawEmail =
    typeof body === "object" && body !== null && "email" in body
      ? (body as { email: unknown }).email
      : undefined;
  if (typeof rawEmail !== "string") {
    return fail("invalid_email", 400);
  }
  const email = rawEmail.trim().toLowerCase();

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return fail("invalid_email", 400);
  }

  // Resend's POST /audiences/{id}/contacts is idempotent — it returns 201
  // with the same contact id on duplicate, never 422 — so we look the
  // contact up first to distinguish "new signup" from "repeat clicker".
  const wasAlreadyThere = await existsInAudience({ apiKey, audienceId, email });

  const addRes = await fetch(
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

  if (!addRes.ok) {
    return fail("upstream_error", 502, `Resend responded ${addRes.status}`);
  }

  // alreadySubscribed = "we know they were on the list before this request".
  // If the lookup itself failed (undefined), default to false so the welcome
  // sends — a duplicate welcome is preferable to silent dropoff.
  const alreadySubscribed = wasAlreadyThere === true;

  // Welcome email is best-effort. Runs after the response so the user
  // doesn't wait, and a delivery failure doesn't break signup.
  // Only sends to genuinely new contacts to avoid spamming repeat clickers.
  if (fromEmail && !alreadySubscribed) {
    after(async () => {
      try {
        const welcome = buildWelcomeEmail();
        const sendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [email],
            subject: welcome.subject,
            html: welcome.html,
            text: welcome.text,
            ...(replyTo ? { reply_to: replyTo } : {}),
          }),
        });
        if (!sendRes.ok) {
          const detail = await sendRes.text().catch(() => "");
          console.error(
            `[waitlist] welcome email failed: ${sendRes.status} ${detail.slice(0, 200)}`
          );
        }
      } catch (err) {
        console.error("[waitlist] welcome email threw:", err);
      }
    });
  }

  return NextResponse.json({ ok: true, alreadySubscribed });
}
