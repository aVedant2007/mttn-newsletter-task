import Link from "next/link";
import { PUBLICATION } from "../lib/articles";

export default function Masthead() {
  return (
    <header id="top" className="relative z-10 border-b border-rule bg-ink">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
        <Link href="/" className="font-display text-2xl tracking-wide md:text-3xl">
          {PUBLICATION}
          <span className="text-teal">.</span>
        </Link>
        <nav className="flex items-center gap-5 md:gap-8">
          <Link href="/articles" className="label hover:text-ivory transition-colors">
            Articles
          </Link>
          <Link href="/categories" className="label hover:text-ivory transition-colors hidden sm:inline">
            Categories
          </Link>
          <a
            href="#subscribe"
            className="label border border-rule px-3 py-2 text-ivory transition-colors hover:border-brass hover:text-brass"
          >
            Subscribe
          </a>
          <Link
            href="/admin/articles/new"
            className="label border border-teal/50 px-3 py-2 text-teal transition-colors hover:bg-teal hover:text-ink"
          >
            Write
          </Link>
        </nav>
      </div>
    </header>
  );
}
