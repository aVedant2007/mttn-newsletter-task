"use client";

import { useState } from "react";
import Link from "next/link";
import { Article, formatDate } from "../lib/articles";

// Archive covers use the site's teal, cobalt, and paper accents.
const TONES: Record<Article["tone"], { bg: string; fg: string; accent: string }> = {
  ochre: { bg: "#315be8", fg: "#f3f1e9", accent: "#f0d742" },
  oxblood: { bg: "#164c49", fg: "#e8e6df", accent: "#71d1c2" },
  moss: { bg: "#24423e", fg: "#e8e6df", accent: "#71d1c2" },
  slate: { bg: "#174f59", fg: "#e8e6df", accent: "#8cdbd0" },
  bone: { bg: "#d7d4ca", fg: "#171918", accent: "#315be8" },
};

export default function FeaturedStage({ items }: { items: Article[] }) {
  const [active, setActive] = useState(0);
  const current = items[active];
  const mid = (items.length - 1) / 2;

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-6">
      {/* ---- The covers ---- */}
      <div
        role="list"
        aria-label="Featured articles"
        className="-mx-5 flex items-end overflow-x-auto px-5 pb-10 pt-10 [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0"
      >
        {items.map((a, i) => {
          const t = TONES[a.tone];
          const selected = i === active;
          const tilt = selected ? 0 : (i - mid) * 2.2;
          return (
            <button
              key={a.slug}
              role="listitem"
              type="button"
              aria-pressed={selected}
              aria-controls="postcard"
              onClick={() => setActive(i)}
              className="paper-grain group relative ml-3 h-60 w-36 shrink-0 rounded-[2px] text-left shadow-[0_18px_40px_-14px_rgba(0,0,0,0.8)] transition-[transform,box-shadow,margin] duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] first:ml-0 md:-ml-12 md:h-72 md:w-40 lg:h-80 lg:w-44"
              style={{
                background: `linear-gradient(160deg, ${t.bg}, color-mix(in srgb, ${t.bg} 70%, black))`,
                color: t.fg,
                zIndex: selected ? 30 : i,
                transform: `translateY(${selected ? -22 : (i % 2) * 6}px) rotate(${tilt}deg) scale(${selected ? 1.07 : 1})`,
                marginLeft: undefined,
              }}
            >
              <span className="absolute inset-3 border border-current opacity-25" aria-hidden />
              <span className="relative flex h-full flex-col justify-between p-5">
                <span className="flex items-start justify-between">
                  <span className="font-mono text-[0.625rem] tracking-[0.16em]" style={{ color: t.accent }}>
                    № {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[0.625rem] uppercase tracking-[0.14em] opacity-70">
                    {a.readingTime} min
                  </span>
                </span>
                <span>
                  <span
                    className="mb-3 block font-mono text-[0.625rem] uppercase tracking-[0.16em]"
                    style={{ color: t.accent }}
                  >
                    {a.category}
                  </span>
                  <span className="block font-display text-[1.45rem] font-medium leading-[1.02] md:text-[1.6rem]">
                    {a.title}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* ---- The postcard ---- */}
      <article
        id="postcard"
        key={current.slug}
        aria-live="polite"
        className="animate-deal paper-grain relative mx-auto w-full max-w-md rounded-[2px] bg-paper p-7 text-ink shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] md:p-9 lg:mx-0"
      >
        {/* stamp + postmark */}
        <div className="absolute right-6 top-6 flex items-start gap-3" aria-hidden>
          <svg width="64" height="64" viewBox="0 0 64 64" className="opacity-50">
            <circle cx="32" cy="32" r="27" fill="none" stroke="#12110f" strokeWidth="1.2" />
            <circle cx="32" cy="32" r="21" fill="none" stroke="#12110f" strokeWidth="0.8" strokeDasharray="2 3" />
            <text x="32" y="30" textAnchor="middle" fontSize="6.5" fontFamily="monospace" fill="#12110f">
              MARGINALIA
            </text>
            <text x="32" y="40" textAnchor="middle" fontSize="6" fontFamily="monospace" fill="#12110f">
              {formatDate(current.date).toUpperCase()}
            </text>
          </svg>
          <div
            className="h-14 w-11 border border-dashed border-ink/50"
            style={{ background: TONES[current.tone].bg, opacity: 0.85 }}
          />
        </div>

        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink/60">
          {current.category}
        </p>
        <h3 className="mt-3 max-w-[16ch] font-display text-[2.1rem] font-medium leading-[1.02] md:text-[2.6rem]">
          {current.title}
        </h3>
        <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink/80">{current.excerpt}</p>

        <dl className="mt-7 grid grid-cols-3 gap-4 border-t border-ink/20 pt-5">
          <div>
            <dt className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink/50">By</dt>
            <dd className="mt-1 text-sm">{current.author?.trim() || "Author unavailable"}</dd>
          </div>
          <div>
            <dt className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink/50">Read</dt>
            <dd className="mt-1 text-sm">{current.readingTime} min</dd>
          </div>
          <div>
            <dt className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink/50">Published</dt>
            <dd className="mt-1 text-sm">{formatDate(current.date)}</dd>
          </div>
        </dl>

        <Link
          href={`/articles/${current.slug}`}
          className="mt-8 inline-flex items-center gap-3 bg-signal px-5 py-3 font-mono text-xs uppercase tracking-[0.16em] text-cobalt transition-colors hover:text-black"
        >
          Read article <span aria-hidden>→</span>
        </Link>
      </article>
    </div>
  );
}
