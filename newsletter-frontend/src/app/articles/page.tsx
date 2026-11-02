import { Suspense } from "react";
import Link from "next/link";
import ArticleRow from "../components/ArticleRow";
import Masthead from "../components/Masthead";
import { getPublishedArticles, PUBLICATION, type Article } from "../lib/articles";

async function ArticleIndex() {
  let articles: Article[];
  try {
    articles = await getPublishedArticles();
  } catch {
    return <p className="mt-8 text-dim">Articles are temporarily unavailable. Check that the Go API is running and its database migrations are applied.</p>;
  }

  if (articles.length === 0) {
    return <p className="mt-8 text-dim">No articles have been published yet.</p>;
  }

  return (
    <>
      <header className="mt-10 border-b border-rule pb-7">
        <p className="label">The complete index · {String(articles.length).padStart(2, "0")} entries</p>
        <h1 className="mt-3 font-display text-5xl font-medium md:text-7xl">All articles</h1>
        <p className="mt-4 max-w-xl text-dim">Essays, notes, and dispatches from the Marginalia archive.</p>
      </header>
      <div className="mt-8">
        {articles.map((article) => <ArticleRow key={article.id ?? article.slug} article={article} />)}
      </div>
    </>
  );
}

export default function ArticlesPage() {
  return (
    <>
      <Masthead />
      <main className="mx-auto min-h-[70vh] max-w-6xl px-5 py-14 md:px-8 md:py-20">
        <Link href="/" className="label transition-colors hover:text-teal">← Back to {PUBLICATION}</Link>
        <Suspense fallback={<div className="mt-10 h-52 bg-ink-2" />}>
          <ArticleIndex />
        </Suspense>
      </main>
      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-rule px-5 py-8 md:px-8">
        <Link href="/" className="font-display text-xl">{PUBLICATION}<span className="text-teal">.</span></Link>
        <Link href="/#subscribe" className="label transition-colors hover:text-signal">Get the newsletter ↗</Link>
      </footer>
    </>
  );
}
