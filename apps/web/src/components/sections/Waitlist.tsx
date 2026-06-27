"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; alreadySubscribed: boolean }
  | { kind: "error"; message: string };

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status.kind === "submitting") return;

    setStatus({ kind: "submitting" });

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data: { ok?: boolean; error?: string; alreadySubscribed?: boolean } =
        await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        setStatus({
          kind: "success",
          alreadySubscribed: data.alreadySubscribed === true,
        });
        return;
      }

      const message =
        data.error === "invalid_email"
          ? "That email doesn't look right. Try again."
          : "Something broke on our end. Try again in a minute.";
      setStatus({ kind: "error", message });
    } catch {
      setStatus({
        kind: "error",
        message: "Network error. Check your connection and try again.",
      });
    }
  }

  const isSubmitting = status.kind === "submitting";
  const isSuccess = status.kind === "success";

  return (
    <section id="waitlist" className="border-t border-[var(--color-border)]">
      <div className="mx-auto max-w-6xl px-6 py-28">
        <div className="rounded-none border-2 border-[var(--ink)] bg-[var(--color-subtle)] p-10 sm:p-16 relative overflow-hidden shadow-[8px_8px_0_0_var(--ink)]">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[320px] w-[640px] bg-[radial-gradient(closest-side,rgba(0,0,0,0.08),transparent)] dark:bg-[radial-gradient(closest-side,rgba(255,255,255,0.1),transparent)]"
          />

          <div className="relative flex flex-col items-start gap-6 max-w-2xl">
            <div className="text-sm font-mono text-[var(--color-muted)]">
              06 — get the build
            </div>
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-balance leading-[1.1]">
              Be the first to ship integrations
              <br className="hidden sm:block" />
              <span className="text-[var(--color-muted)]">
                without uploading your code.
              </span>
            </h2>
            <p className="text-lg text-[var(--color-muted-foreground)] text-pretty">
              We&apos;re building in public. Drop your email to get the first
              desktop build, the registry preview, and the launch announcement.
            </p>

            {!isSuccess ? (
              <form
                onSubmit={handleSubmit}
                className="w-full max-w-md flex flex-col sm:flex-row gap-2"
                noValidate
              >
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status.kind === "error") setStatus({ kind: "idle" });
                  }}
                  placeholder="you@yourdomain.com"
                  aria-invalid={status.kind === "error"}
                  autoComplete="email"
                  inputMode="email"
                  spellCheck={false}
                  maxLength={254}
                  className="flex-1 rounded-none border-2 border-[var(--ink)] bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/30 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="btn-brutal btn-blue"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Adding
                    </>
                  ) : (
                    <>
                      Notify me
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm">
                {status.alreadySubscribed
                  ? "You're already on the list. We'll email you when the first build ships."
                  : "You're on the list. We'll email you when the first build ships."}
              </div>
            )}

            {status.kind === "error" && (
              <div
                role="alert"
                className="text-sm text-red-500 dark:text-red-400"
              >
                {status.message}
              </div>
            )}

            <p className="text-xs text-[var(--color-muted)] mt-2">
              We store your email only. No tracking, no marketing list resale,
              no surprise newsletters.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
