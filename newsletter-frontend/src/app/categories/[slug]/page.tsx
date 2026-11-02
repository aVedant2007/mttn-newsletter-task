import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleRow from "../../components/ArticleRow";
import Masthead from "../../components/Masthead";
import { getCategories, getPublishedArticles, slugify, type Article, type Category } from "../../lib/articles";

async function CategoryArticles({ slug }: { slug: string }) {
  let categories: Category[];
  let articles: Article[];
  try {
    [categories, articles] = await Promise.all([getCategories(), getPublishedArticles()]);
  } catch {
    return <p className="mt-8 text-dim">This collection is temporarily unavailable.</p>;
  }

  const category = categories.find((item) => (item.slug || slugify(item.name)) === slug);
  if (!category) notFound();
  const matches = articles.filter((article) => article.category === category.name);

  return (
    <>
      <header className="border-b border-rule pb-7">
        <p className="label">Collection · {String(matches.length).padStart(2, "0")} articles</p>
        <h1 className="mt-3 font-display text-5xl font-medium md:text-7xl">{category.name}</h1>
      </header>
      {matches.length ? (
        <div className="mt-8">{matches.map((article) => <ArticleRow key={article.id ?? article.slug} article={article} />)}</div>
      ) : (
        <p className="mt-8 text-dim">No published articles in this collection yet.</p>
      )}
    </>
  );
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <>
      <Masthead />
      <main className="mx-auto min-h-[70vh] max-w-6xl px-5 py-14 md:px-8 md:py-20">
        <Link href="/categories" className="label transition-colors hover:text-teal">← All categories</Link>
        <div className="mt-10">
          <Suspense fallback={<div className="h-52 bg-ink-2" aria-label="Loading collection" />}>
            <ResolvedCategory params={params} />
          </Suspense>
        </div>
      </main>
      <footer className="mx-auto max-w-6xl border-t border-rule px-5 py-8 md:px-8">
        <Link href="/articles" className="label transition-colors hover:text-teal">Browse all articles ↗</Link>
      </footer>
    </>
  );
}

async function ResolvedCategory({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CategoryArticles slug={slug} />;
}
