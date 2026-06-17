"use client";

import type { WorkflowPlan } from "@integrateapi/engine";
import {
  ArrowDown,
  Zap,
  KeyRound,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

/*
 * Pure renderer for a WorkflowPlan.
 *
 * Receives the plan and lays it out as a structured visualization:
 *   - apps row (badges)
 *   - trigger card
 *   - actions list (vertical, with arrows between)
 *   - auth requirements
 *   - warnings (only if any)
 *   - recommendations (only if any)
 *
 * Kept in its own file so it can be reused later by the desktop console
 * unchanged — same plan shape, same visualization.
 */

export function PlanRenderer({ plan }: { plan: WorkflowPlan }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] overflow-hidden">
      {/* Header bar — matches the console preview's traffic-light styling */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[var(--color-border)]">
        <span className="size-2.5 rounded-full bg-red-400/70" />
        <span className="size-2.5 rounded-full bg-yellow-400/70" />
        <span className="size-2.5 rounded-full bg-green-400/70" />
        <span className="ml-3 text-xs text-[var(--color-muted)] font-mono">
          workflow plan · {plan.apps.length} app
          {plan.apps.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="p-6 space-y-8">
        {/* Apps row */}
        <Section label="Apps">
          <div className="flex flex-wrap gap-2">
            {plan.apps.map((app) => (
              <span
                key={app}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[var(--color-border)] bg-[var(--color-subtle)] text-sm font-mono"
              >
                {app}
              </span>
            ))}
          </div>
        </Section>

        {/* Trigger */}
        <Section label="Trigger">
          <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-subtle)] p-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="size-4 text-yellow-500" />
              <span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                when
              </span>
            </div>
            <div className="font-mono text-sm">
              <span className="text-[var(--color-foreground)]">
                {plan.trigger.provider}
              </span>
              <span className="text-[var(--color-muted)]"> · </span>
              <span className="text-[var(--color-foreground)]">
                {plan.trigger.event}
              </span>
            </div>
          </div>
        </Section>

        {/* Actions */}
        {plan.actions.length > 0 && (
          <Section label={`Actions (${plan.actions.length})`}>
            <div className="space-y-2">
              {plan.actions.map((action, i) => (
                <div key={i}>
                  {i > 0 && (
                    <div className="flex justify-center py-1">
                      <ArrowDown className="size-4 text-[var(--color-muted)]" />
                    </div>
                  )}
                  <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-subtle)] p-4">
                    <div className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-1">
                      step {i + 1}
                    </div>
                    <div className="font-mono text-sm">
                      <span className="text-[var(--color-foreground)]">
                        {action.provider}
                      </span>
                      <span className="text-[var(--color-muted)]"> · </span>
                      <span className="text-[var(--color-foreground)]">
                        {action.action}
                      </span>
                    </div>
                    {action.notes ? (
                      <div className="text-sm text-[var(--color-muted-foreground)] mt-2">
                        {action.notes}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Auth */}
        {plan.auth.length > 0 && (
          <Section label="Auth required">
            <ul className="space-y-1.5">
              {plan.auth.map((a, i) => (
                <li
                  key={`${a.provider}-${a.id}-${i}`}
                  className="flex items-start gap-2.5 text-sm"
                >
                  <KeyRound className="size-4 mt-0.5 shrink-0 text-[var(--color-muted)]" />
                  <span className="font-mono text-[var(--color-foreground)]">
                    {a.id}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded border border-[var(--color-border)] text-[var(--color-muted-foreground)]">
                    {a.type}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Warnings (only if any) */}
        {plan.warnings.length > 0 && (
          <Section label="Warnings" tone="warn">
            <ul className="space-y-1.5">
              {plan.warnings.map((w, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-[var(--color-foreground)]"
                >
                  <AlertTriangle className="size-4 mt-0.5 shrink-0 text-yellow-500" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Recommendations (only if any) */}
        {plan.recommendations.length > 0 && (
          <Section label="Recommendations">
            <ul className="space-y-1.5">
              {plan.recommendations.map((r, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-[var(--color-foreground)]"
                >
                  <Lightbulb className="size-4 mt-0.5 shrink-0 text-blue-500" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({
  label,
  children,
  tone,
}: {
  label: string;
  children: React.ReactNode;
  tone?: "warn";
}) {
  return (
    <div>
      <div
        className={
          "text-xs uppercase tracking-wide mb-3 font-mono " +
          (tone === "warn"
            ? "text-yellow-600 dark:text-yellow-500"
            : "text-[var(--color-muted)]")
        }
      >
        {label}
      </div>
      {children}
    </div>
  );
}
