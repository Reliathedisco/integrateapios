import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";
import { GITHUB_URL } from "@/lib/links";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-32 h-[480px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(0,0,0,0.06),transparent_70%)] dark:bg-[radial-gradient(60%_60%_at_50%_0%,rgba(255,255,255,0.08),transparent_70%)]" />

      <div className="mx-auto max-w-6xl px-6 pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div className="flex flex-col items-start gap-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-subtle)] px-3 py-1 text-xs text-[var(--color-muted-foreground)]">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            local-first · bring your own AI · zero storage
          </div>

          <h1 className="text-balance text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05]">
            The AI integration console
            <br />
            <span className="text-[var(--color-muted)]">
              that keeps your code yours.
            </span>
          </h1>

          <p className="text-pretty max-w-2xl text-lg text-[var(--color-muted-foreground)] leading-relaxed">
            Connect Stripe, Clerk, Resend, Supabase, OpenAI, and hundreds of
            other services through a desktop console that never uploads your
            code, never stores your prompts, and never trains on your data.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="#waitlist"
              className="inline-flex items-center gap-2 rounded-md bg-[var(--color-foreground)] text-[var(--color-background)] px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
            >
              Join the waitlist
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--color-subtle)] transition-colors"
            >
              <Github className="size-4" />
              View on GitHub
            </Link>
          </div>
        </div>

        <ConsolePreview />
      </div>
    </section>
  );
}

function ConsolePreview() {
  return (
    <div className="mt-16 rounded-2xl border border-[var(--color-border)] bg-[var(--color-subtle)] p-2 shadow-[0_12px_24px_rgba(0,0,0,0.06),0_4px_8px_rgba(0,0,0,0.04)]">
      <div className="rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[var(--color-border)]">
          <span className="size-2.5 rounded-full bg-red-400/70" />
          <span className="size-2.5 rounded-full bg-yellow-400/70" />
          <span className="size-2.5 rounded-full bg-green-400/70" />
          <span className="ml-3 text-xs text-[var(--color-muted)] font-mono">
            integrateapi · ephemeral session
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] divide-y lg:divide-y-0 lg:divide-x divide-[var(--color-border)]">
          <div className="p-6 space-y-6">
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-2">
                Prompt
              </div>
              <div className="font-mono text-sm">
                stripe subscriptions with clerk
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-2">
                AI provider
              </div>
              <div className="text-sm">your key · gpt-5-mini</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-2">
                Session
              </div>
              <div className="text-sm text-[var(--color-muted-foreground)]">
                in-memory · cleared on close
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6 font-mono text-sm">
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-2 font-sans">
                Architecture
              </div>
              <ul className="space-y-1 text-[var(--color-foreground)]">
                <li>app/api/stripe/webhook/route.ts</li>
                <li>app/(billing)/checkout/page.tsx</li>
                <li>lib/stripe.ts</li>
              </ul>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-2 font-sans">
                Env vars
              </div>
              <ul className="space-y-1">
                <li className="text-[var(--color-muted-foreground)]">
                  STRIPE_SECRET_KEY
                </li>
                <li className="text-[var(--color-muted-foreground)]">
                  STRIPE_WEBHOOK_SECRET
                </li>
                <li className="text-[var(--color-muted-foreground)]">
                  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                </li>
                <li className="text-[var(--color-muted-foreground)]">
                  CLERK_SECRET_KEY
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-2 font-sans">
                Security checklist
              </div>
              <ul className="space-y-1.5 text-[var(--color-muted-foreground)]">
                <li>✓ Never expose STRIPE_SECRET_KEY in client components</li>
                <li>✓ Verify webhook signatures on every request</li>
                <li>✓ Treat webhooks as source of truth, not success_url</li>
                <li>✓ Sync Clerk user IDs to Stripe customer metadata</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
