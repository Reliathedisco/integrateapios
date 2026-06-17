const audiences = [
  {
    name: "Solo developers",
    line: "Move faster without sacrificing security.",
  },
  {
    name: "Startup founders",
    line: "Build integrations safely without hiring specialists for every service.",
  },
  {
    name: "Agencies",
    line: "Standardize architecture and onboarding across projects.",
  },
  {
    name: "AI-assisted devs",
    line: "Use GPT, Claude, Gemini, or local models while keeping ownership of your code.",
  },
  {
    name: "Security teams",
    line: "Avoid repo uploads, cloud storage, and unnecessary third-party access.",
  },
];

export function Audiences() {
  return (
    <section className="border-t border-[var(--color-border)] bg-[var(--color-subtle)]">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="flex flex-col gap-4 mb-12">
          <div className="text-sm font-mono text-[var(--color-muted)]">
            05 — who it&apos;s for
          </div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight max-w-3xl text-balance">
            Built for people who ship.
          </h2>
        </div>

        <ul className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
          {audiences.map((a) => (
            <li
              key={a.name}
              className="py-5 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-2 md:gap-12 items-baseline"
            >
              <span className="text-base font-medium tracking-tight">
                {a.name}
              </span>
              <span className="text-base text-[var(--color-muted-foreground)]">
                {a.line}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
