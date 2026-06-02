import { Check, X } from "lucide-react";

const promises = [
  "Your code stays on your machine",
  "Sessions disappear when you close the app",
  "Bring your own AI key — we never see it",
  "No repo uploads, ever",
  "No training on your data",
  "Every file write requires explicit approval",
];

const wontDo = [
  "Accept repo uploads",
  "Store prompts or AI responses",
  "Train on your data",
  "Generate code before Phase 3",
  "Lock you into our platform",
  "Add telemetry by default",
];

export function Trust() {
  return (
    <section id="trust" className="border-t border-[var(--color-border)]">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-16">
          <div className="flex flex-col gap-4">
            <div className="text-sm font-mono text-[var(--color-muted)]">
              03 — trust by design
            </div>
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-balance leading-[1.1]">
              We removed ourselves from the trust chain.
            </h2>
            <p className="text-lg text-[var(--color-muted-foreground)] text-pretty mt-2">
              Most AI tools ask you to trust them. We built a product that
              doesn&apos;t require trust. The architecture is the guarantee.
            </p>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-4">
              If IntegrateAPI OS shut down tomorrow, your code would still
              work. Your integrations would still work. Your data would remain
              yours. There is no platform dependency built into your
              application.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 flex flex-col gap-4">
              <div className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                What we do
              </div>
              <ul className="space-y-2.5">
                {promises.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-2.5 text-sm leading-snug"
                  >
                    <Check className="size-4 mt-0.5 shrink-0 text-emerald-500" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-subtle)] p-6 flex flex-col gap-4">
              <div className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                What we never do
              </div>
              <ul className="space-y-2.5">
                {wontDo.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-2.5 text-sm leading-snug text-[var(--color-muted-foreground)]"
                  >
                    <X className="size-4 mt-0.5 shrink-0 text-red-400/80" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
