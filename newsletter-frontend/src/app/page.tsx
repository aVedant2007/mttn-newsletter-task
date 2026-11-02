import { Suspense } from "react";
import Link from "next/link";
import Masthead from "./components/Masthead";
import FeaturedStage from "./components/FeaturedStage";
import SubscribeForm from "./components/SubscribeForm";
import { getPublishedArticles, PUBLICATION, type Article } from "./lib/articles";

async function LatestIssueLink() {
  let article: Article | undefined;
  try {
    article = (await getPublishedArticles())[0];
  } catch {
    article = undefined;
  }

  return (
    <Link
      href={article ? `/articles/${article.slug}` : "/articles"}
      className="inline-flex w-fit items-center gap-4 bg-signal px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] text-[#000000] transition-colors hover:bg-teal"
      style={{ color: "#000000" }}
    >
      {article ? "Read the latest issue" : "Browse articles"} <span aria-hidden>↗</span>
    </Link>
  );
}

async function RecentWriting() {
  let articles: Article[];
  try {
    articles = await getPublishedArticles();
  } catch {
    return (
      <section id="featured" className="border-b border-rule bg-ink-2">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <p className="label">The reading room</p>
          <h2 className="mt-3 font-display text-4xl font-medium md:text-5xl">Recent writing</h2>
          <p className="mt-5 text-dim">Articles are temporarily unavailable. Check that the Go API is running and its database migrations are applied.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="featured" className="border-b border-rule bg-ink-2">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="label">The reading room · 01—{String(Math.min(articles.length, 5)).padStart(2, "0")}</p>
            <h2 className="mt-3 font-display text-4xl font-medium md:text-5xl">Recent writing</h2>
          </div>
          <Link
            href="/articles"
            className="label inline-flex items-center gap-2 border-b border-rule pb-2 transition-colors hover:border-teal hover:text-teal md:justify-self-end"
          >
            View all articles <span aria-hidden>↗</span>
          </Link>
        </div>
        {articles.length > 0 ? (
          <div className="mt-7 border-t border-rule pt-2">
            <FeaturedStage items={articles.slice(0, 5)} />
          </div>
        ) : (
          <p className="mt-7 border-t border-rule pt-6 text-dim">No articles have been published yet.</p>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Masthead />

      <main>
        <section className="relative overflow-hidden border-b border-rule">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 top-20 hidden h-[28rem] w-72 rotate-6 border border-rule bg-ink-2 md:block" />
            <div className="absolute right-24 top-36 hidden h-[27rem] w-72 -rotate-3 border border-rule bg-ink md:block" />
            <div className="absolute right-44 top-56 hidden h-3 w-3 rounded-full bg-teal md:block" />
          </div>

          <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-14 md:px-8 md:pb-28 md:pt-20">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-teal" />
              <p className="label">Independent writing · Essays, notes, and memoir</p>
            </div>
            <h1 className="mt-8 max-w-4xl font-display text-[3.5rem] font-medium leading-[0.92] tracking-tight md:text-[6.8rem]">
              Newletter project<br className="hidden md:block" /> for <span className="text-teal">MTTN</span>
            </h1>
            <div className="mt-9 grid max-w-4xl gap-8 md:grid-cols-[1fr_auto] md:items-end">
              <p className="max-w-xl text-lg leading-relaxed text-dim md:text-xl">
                A small publication of essays, notes, and memoir. Each issue gathers writing worth sitting with, away from the rush of the feed.
              </p>
              <Suspense fallback={<div className="h-11 w-52 bg-signal" aria-label="Loading latest article link" />}>
                <LatestIssueLink />
              </Suspense>
            </div>
            <div className="mt-12 flex items-center gap-3 border-t border-rule pt-4 md:mt-16">
              <span className="label">Filed under</span>
              <span className="h-px w-8 bg-rule" />
              <span className="label text-ivory">Long-form writing / notes / memoir</span>
            </div>
          </div>
        </section>

        <Suspense fallback={<section className="min-h-[34rem] border-b border-rule bg-ink-2" aria-label="Loading recent writing" />}>
          <RecentWriting />
        </Suspense>

        <section id="subscribe" className="border-b border-rule">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1fr_1fr] md:items-center md:px-8 md:py-24">
            <div>
              <p className="label">The newsletter</p>
              <h2 className="mt-4 max-w-xl font-display text-4xl font-medium leading-[1.02] md:text-6xl">
                Good writing, delivered <span className="text-teal">occasionally.</span>
              </h2>
              <p className="mt-5 max-w-md text-dim">
                New essays and notes, sent when they are ready. No weekly quota, tracking, or filler.
              </p>
            </div>
            <div className="border border-rule bg-ink-2 p-6 md:p-8">
              <p className="label mb-5">Join the readership</p>
              <SubscribeForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 md:px-8">
        <span className="font-display text-xl">{PUBLICATION}<span className="text-teal">.</span></span>
        <span className="label">Independent writing · Est. 2026</span>
        <a href="#top" className="label transition-colors hover:text-signal">Back to top ↑</a>
      </footer>
    </>
  );
}
