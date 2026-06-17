"use client";

/*
 * TryItLive — interactive BYOK demo of the Phase 1 planner.
 *
 * The visitor:
 *   1. Picks an AI provider (OpenAI or Anthropic).
 *   2. Pastes their own API key. It's stored ONLY in localStorage on
 *      their device — never sent to our server.
 *   3. Types or picks a workflow prompt.
 *   4. The browser calls the provider's API DIRECTLY using the engine's
 *      provider adapter. Our origin server is never in the loop.
 *
 * Why this design:
 *   - It is the trust promise made concrete. You can verify in DevTools.
 *   - Friction is the filter — visitors who paste their key are the
 *     audience we actually want.
 *   - Zero infrastructure cost: no API key on our side, no rate limits
 *     to enforce, no abuse vector.
 *
 * Trade-off accepted: ~50%+ of casual visitors will bounce off the key
 * step. That's by design — the brand is BYOK.
 */

import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Loader2,
  Lock,
  Trash2,
  ExternalLink,
} from "lucide-react";
import {
  plan as runPlan,
  OpenAIProvider,
  AnthropicProvider,
  type WorkflowPlan,
} from "@integrateapi/engine";
import { PlanRenderer } from "./PlanRenderer";

type ProviderId = "openai" | "anthropic";

type Status =
  | { kind: "idle" }
  | { kind: "running"; startedAt: number }
  | { kind: "success"; plan: WorkflowPlan; tookMs: number }
  | { kind: "error"; message: string; raw: string };

const LS_KEYS = {
  provider: "iaos.demo.provider",
  apiKey: "iaos.demo.apiKey",
  prompt: "iaos.demo.lastPrompt",
};

const EXAMPLE_PROMPTS = [
  {
    label: "Stripe → HubSpot + Slack",
    prompt:
      "When a Stripe customer is created, create a contact in HubSpot and send a Slack notification.",
  },
  {
    label: "GitHub → Slack",
    prompt:
      "When a pull request is opened in GitHub, send a message to the Slack #eng channel.",
  },
  {
    label: "Airtable → OpenAI",
    prompt:
      "When a new record is created in Airtable, run an OpenAI chat completion to summarize the record and write the summary back.",
  },
];

const PROVIDER_DOCS: Record<ProviderId, { name: string; keyUrl: string; keyHint: string }> = {
  openai: {
    name: "OpenAI",
    keyUrl: "https://platform.openai.com/api-keys",
    keyHint: "sk-…",
  },
  anthropic: {
    name: "Anthropic",
    keyUrl: "https://console.anthropic.com/settings/keys",
    keyHint: "sk-ant-…",
  },
};

export function TryItLive() {
  const [provider, setProvider] = useState<ProviderId>("openai");
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [elapsedMs, setElapsedMs] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount (client-side only).
  useEffect(() => {
    try {
      const p = localStorage.getItem(LS_KEYS.provider);
      if (p === "openai" || p === "anthropic") setProvider(p);
      const k = localStorage.getItem(LS_KEYS.apiKey);
      if (k) setApiKey(k);
      const lastPrompt = localStorage.getItem(LS_KEYS.prompt);
      if (lastPrompt) setPrompt(lastPrompt);
    } catch {
      // localStorage may throw in private mode — silently ignore.
    }
    setHydrated(true);
  }, []);

  // Tick elapsed time while a plan is running so the user sees progress.
  useEffect(() => {
    if (status.kind !== "running") {
      setElapsedMs(0);
      return;
    }
    const tick = () => setElapsedMs(Date.now() - status.startedAt);
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [status]);

  const persistProvider = useCallback((p: ProviderId) => {
    setProvider(p);
    try {
      localStorage.setItem(LS_KEYS.provider, p);
    } catch {}
  }, []);

  const persistKey = useCallback((k: string) => {
    setApiKey(k);
    try {
      if (k) localStorage.setItem(LS_KEYS.apiKey, k);
      else localStorage.removeItem(LS_KEYS.apiKey);
    } catch {}
  }, []);

  const persistPrompt = useCallback((p: string) => {
    setPrompt(p);
    try {
      if (p) localStorage.setItem(LS_KEYS.prompt, p);
    } catch {}
  }, []);

  const forgetKey = useCallback(() => {
    persistKey("");
  }, [persistKey]);

  const canSubmit =
    hydrated &&
    apiKey.trim().length > 0 &&
    prompt.trim().length > 0 &&
    status.kind !== "running";

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;

      const startedAt = Date.now();
      setStatus({ kind: "running", startedAt });

      try {
        const ai =
          provider === "openai"
            ? new OpenAIProvider({ apiKey: apiKey.trim() })
            : new AnthropicProvider({
                apiKey: apiKey.trim(),
                dangerousDirectBrowserAccess: true,
              });

        const plan = await runPlan({ prompt: prompt.trim(), ai });
        setStatus({
          kind: "success",
          plan,
          tookMs: Date.now() - startedAt,
        });
      } catch (err) {
        const raw = err instanceof Error ? err.message : String(err);
        setStatus({
          kind: "error",
          message: friendlyError(raw),
          raw,
        });
      }
    },
    [apiKey, canSubmit, prompt, provider]
  );

  return (
    <section id="try-it-live" className="border-t border-[var(--color-border)]">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="flex flex-col gap-4 mb-12">
          <div className="text-sm font-mono text-[var(--color-muted)]">
            04 — try it live
          </div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-balance leading-[1.1]">
            Watch your key
            <br className="hidden sm:block" />
            <span className="text-[var(--color-muted)]">
              not leave your browser.
            </span>
          </h2>
          <p className="text-lg text-[var(--color-muted-foreground)] text-pretty max-w-2xl">
            Paste your own OpenAI or Anthropic key, type a workflow prompt,
            and the planner runs directly from your browser to the
            provider&apos;s API. Open DevTools — there&apos;s no detour
            through our servers to find.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 items-start">
          {/* Left: input panel */}
          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-subtle)] p-6 flex flex-col gap-5"
            noValidate
          >
            {/* Provider selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide text-[var(--color-muted)] font-mono">
                Provider
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["openai", "anthropic"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => persistProvider(p)}
                    className={
                      "rounded-md border px-3 py-2 text-sm transition-colors " +
                      (provider === p
                        ? "border-[var(--color-foreground)] bg-[var(--color-background)] text-[var(--color-foreground)]"
                        : "border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]")
                    }
                  >
                    {PROVIDER_DOCS[p].name}
                  </button>
                ))}
              </div>
            </div>

            {/* API key */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="apikey"
                  className="text-xs uppercase tracking-wide text-[var(--color-muted)] font-mono"
                >
                  Your API key
                </label>
                {apiKey ? (
                  <button
                    type="button"
                    onClick={forgetKey}
                    className="inline-flex items-center gap-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
                  >
                    <Trash2 className="size-3" />
                    forget my key
                  </button>
                ) : null}
              </div>
              <input
                id="apikey"
                type="password"
                value={apiKey}
                onChange={(e) => persistKey(e.target.value)}
                placeholder={PROVIDER_DOCS[provider].keyHint}
                autoComplete="off"
                spellCheck={false}
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--color-foreground)]/15 focus:border-[var(--color-foreground)]/30"
              />
              <div className="text-xs text-[var(--color-muted)] flex items-start gap-1.5">
                <Lock className="size-3 mt-0.5 shrink-0" />
                <span>
                  Stored only in your browser&apos;s localStorage. Sent
                  straight to {PROVIDER_DOCS[provider].name}, never to us.{" "}
                  <a
                    href={PROVIDER_DOCS[provider].keyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-[var(--color-foreground)] inline-flex items-center gap-0.5"
                  >
                    get a key
                    <ExternalLink className="size-3" />
                  </a>
                </span>
              </div>
            </div>

            {/* Examples */}
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide text-[var(--color-muted)] font-mono">
                Examples
              </label>
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLE_PROMPTS.map((ex) => (
                  <button
                    key={ex.label}
                    type="button"
                    onClick={() => persistPrompt(ex.prompt)}
                    className="text-xs px-2 py-1 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:border-[var(--color-foreground)]/30 transition-colors"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="prompt"
                className="text-xs uppercase tracking-wide text-[var(--color-muted)] font-mono"
              >
                Workflow prompt
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => persistPrompt(e.target.value)}
                rows={4}
                placeholder="When a Stripe customer is created, …"
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-foreground)]/15 focus:border-[var(--color-foreground)]/30 resize-y min-h-[96px]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--color-foreground)] text-[var(--color-background)] px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status.kind === "running" ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating {(elapsedMs / 1000).toFixed(1)}s
                </>
              ) : (
                <>
                  Generate plan
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* Right: output panel */}
          <div className="min-h-[400px]">
            {status.kind === "idle" && <IdleHint />}
            {status.kind === "running" && <RunningHint />}
            {status.kind === "error" && (
              <ErrorPanel
                message={status.message}
                raw={status.raw}
                onRetry={() => setStatus({ kind: "idle" })}
              />
            )}
            {status.kind === "success" && (
              <div className="space-y-3">
                <div className="text-xs font-mono text-[var(--color-muted)]">
                  plan generated in {(status.tookMs / 1000).toFixed(1)}s ·{" "}
                  {PROVIDER_DOCS[provider].name}
                </div>
                <PlanRenderer plan={status.plan} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// --- panels ---------------------------------------------------------------

function IdleHint() {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-10 h-full min-h-[400px] flex flex-col items-center justify-center text-center gap-3">
      <div className="text-sm font-mono text-[var(--color-muted)]">
        waiting for input
      </div>
      <div className="text-[var(--color-muted-foreground)] max-w-sm">
        Pick a provider, paste your key, type a workflow. The plan appears
        here.
      </div>
    </div>
  );
}

function RunningHint() {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-subtle)] p-10 h-full min-h-[400px] flex flex-col items-center justify-center text-center gap-3">
      <Loader2 className="size-6 animate-spin text-[var(--color-muted)]" />
      <div className="text-sm text-[var(--color-muted-foreground)]">
        Matching providers, then asking the model for a structured plan.
      </div>
    </div>
  );
}

function ErrorPanel({
  message,
  raw,
  onRetry,
}: {
  message: string;
  raw: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-400/30 bg-red-500/5 dark:bg-red-500/10 p-6 space-y-3">
      <div className="text-sm font-mono text-red-600 dark:text-red-400">
        plan failed
      </div>
      <div className="text-[var(--color-foreground)]">{message}</div>
      <details className="text-xs text-[var(--color-muted)]">
        <summary className="cursor-pointer hover:text-[var(--color-foreground)]">
          raw error
        </summary>
        <pre className="mt-2 whitespace-pre-wrap font-mono">{raw}</pre>
      </details>
      <button
        type="button"
        onClick={onRetry}
        className="text-sm underline hover:no-underline text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
      >
        try again
      </button>
    </div>
  );
}

// --- error normalization --------------------------------------------------

function friendlyError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("401") || lower.includes("unauthorized") || lower.includes("invalid_api_key")) {
    return "That API key was rejected. Double-check you pasted the full key and it has the right permissions.";
  }
  if (lower.includes("429") || lower.includes("rate")) {
    return "The provider rate-limited your key. Wait a minute and try again.";
  }
  if (lower.includes("403") || lower.includes("forbidden") || lower.includes("permission")) {
    return "Your key doesn't have permission for this model. Try a different one or check your account.";
  }
  if (lower.includes("network") || lower.includes("failed to fetch")) {
    return "Network error reaching the provider. Check your connection and try again.";
  }
  if (lower.includes("cors")) {
    return "The provider blocked the request from your browser. This is unusual — try the other provider option.";
  }
  return "Something went wrong calling the provider. See raw error below for details.";
}
