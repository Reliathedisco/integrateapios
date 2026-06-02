const steps = [
  {
    name: "Understand",
    desc: "Type what you want to connect. The local engine matches your prompt against a curated integration registry.",
  },
  {
    name: "Structure",
    desc: "Your chosen AI provider returns a transparent plan: architecture, env vars, security checklist, official docs.",
  },
  {
    name: "Build",
    desc: "Review diffs locally. Approve per-file. Apply changes only to your project folder.",
  },
  {
    name: "Launch",
    desc: "Ship with confidence. Every change was reviewed. Every secret stayed local.",
  },
  {
    name: "Improve",
    desc: "Re-scan your project anytime. The plan adapts to what you've already built.",
  },
];

export function Flow() {
  return (
    <section id="flow" className="border-t border-[var(--color-border)]">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="flex flex-col gap-4 mb-16">
          <div className="text-sm font-mono text-[var(--color-muted)]">
            01 — the flow
          </div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight max-w-3xl text-balance">
            Plan first. Code second. Trust always.
          </h2>
          <p className="text-lg text-[var(--color-muted-foreground)] max-w-2xl text-pretty">
            Most AI coding tools generate files. IntegrateAPI OS generates
            understanding — then lets you decide what gets written.
          </p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-px bg-[var(--color-border)] rounded-2xl overflow-hidden border border-[var(--color-border)]">
          {steps.map((step, i) => (
            <li
              key={step.name}
              className="bg-[var(--color-background)] p-6 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[var(--color-muted)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {i < steps.length - 1 && (
                  <span aria-hidden className="text-[var(--color-muted)]">
                    →
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold tracking-tight">
                {step.name}
              </h3>
              <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                {step.desc}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
