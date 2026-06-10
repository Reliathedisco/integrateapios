import Image from "next/image";
import Link from "next/link";
import { GITHUB_URL, X_URL } from "@/lib/links";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2 flex flex-col gap-4">
            <Link href="/" aria-label="IntegrateAPI OS — home">
              <Image
                src="/wordmark.png"
                alt="IntegrateAPI OS"
                width={890}
                height={115}
                className="h-7 sm:h-8 w-auto select-none"
              />
            </Link>
            <p className="text-[var(--color-muted-foreground)] max-w-sm">
              A Reli Studio product. Local-first AI integration intelligence.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-1">
              Product
            </div>
            <Link
              href="#flow"
              className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
            >
              How it works
            </Link>
            <Link
              href="#trust"
              className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
            >
              Trust by design
            </Link>
            <Link
              href="#waitlist"
              className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
            >
              Waitlist
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-1">
              Open
            </div>
            <Link
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
            >
              GitHub
            </Link>
            <Link
              href={X_URL}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
            >
              Build log on X
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--color-border)] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-[var(--color-muted)]">
          <span>© {new Date().getFullYear()} Reli Music LLC.</span>
          <span>structure · restraint · depth</span>
        </div>
      </div>
    </footer>
  );
}
