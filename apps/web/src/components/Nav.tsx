import Image from "next/image";
import Link from "next/link";
import { GITHUB_URL } from "@/lib/links";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--color-background)]/90 border-b-2 border-[var(--ink)]">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          aria-label="IntegrateAPI OS — home"
          className="flex items-center"
        >
          <Image
            src="/wordmark.png"
            alt="IntegrateAPI OS"
            width={890}
            height={115}
            priority
            className="h-5 sm:h-6 w-auto select-none"
          />
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="#flow"
            className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
          >
            How it works
          </Link>
          <Link
            href="#trust"
            className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
          >
            Trust
          </Link>
          <Link
            href="#try-it-live"
            className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
          >
            Try it
          </Link>
          <Link
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
          >
            GitHub
          </Link>
          <Link
            href="#waitlist"
            className="btn-brutal btn-blue px-3 py-1.5"
          >
            Join waitlist
          </Link>
        </nav>
      </div>
    </header>
  );
}
