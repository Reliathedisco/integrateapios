import { KeyRound, Lock, Sparkles } from "lucide-react";

const features = [
  {
    icon: KeyRound,
    title: "Bring your own AI",
    desc: "OpenAI, Anthropic, Gemini, Ollama. Your key, your model, your bill. We never proxy, never log, never train on your prompts.",
    points: [
      "Switch providers per-session",
      "Local LLM via Ollama",
      "Keys stored in OS keychain",
    ],
  },
  {
    icon: Lock,
    title: "Nothing leaves your machine",
    desc: "No repo uploads. No cloud storage. Sessions vanish when you close the app. There is no IntegrateAPI database where your code could live.",
    points: [
      "Zero telemetry by default",
      "Project scans stay local",
      "Ephemeral, in-memory sessions",
    ],
  },
  {
    icon: Sparkles,
    title: "Plan before code",
    desc: "Architecture, env vars, security checklist, official docs — before a single file is written. Code generation comes later, with reviewable diffs.",
    points: [
      "Curated integration registry",
      "Official docs, not hallucinations",
      "Per-file approval on every write",
    ],
  },
];

export function Features() {
  return (
    <section className="border-t border-[var(--color-border)]">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="flex flex-col gap-4 mb-16">
          <div className="text-sm font-mono text-[var(--color-muted)]">
            02 — the principles
          </div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight max-w-3xl text-balance">
            Three rules that don&apos;t move.
          </h2>
          <p className="text-lg text-[var(--color-muted-foreground)] max-w-2xl text-pretty">
            Everything else is negotiable. These three are the product.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--color-border)] rounded-2xl overflow-hidden border border-[var(--color-border)]">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-[var(--color-background)] p-8 flex flex-col gap-5"
            >
              <div className="inline-flex items-center justify-center size-10 rounded-lg bg-[var(--color-subtle)] border border-[var(--color-border)]">
                <f.icon className="size-5" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-semibold tracking-tight">
                  {f.title}
                </h3>
                <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                  {f.desc}
                </p>
              </div>
              <ul className="mt-auto pt-4 border-t border-[var(--color-border)] space-y-1.5 text-sm text-[var(--color-muted-foreground)]">
                {f.points.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <span className="mt-1 size-1 rounded-full bg-[var(--color-foreground)] shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
