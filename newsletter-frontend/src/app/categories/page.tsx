import { Suspense } from "react";
import Link from "next/link";
import Masthead from "../components/Masthead";
import { getCategories, PUBLICATION, slugify, type Category } from "../lib/articles";

async function CategoryIndex() {
  let categories: Category[];
  try {
    categories = await getCategories();
  } catch {
    return <p className="mt-8 text-dim">Categories are temporarily unavailable. Please try again shortly.</p>;
  }
  if (!categories.length) return <p className="mt-8 text-dim">No categories have been added yet.</p>;

  return (
    <ul className="mt-9 grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category, index) => (
        <li key={category.id} className="bg-ink-2">
          <Link href={`/categories/${category.slug || slugify(category.name)}`} className="group flex min-h-24 items-center justify-between px-5 py-5 transition-colors hover:bg-[#202423]">
            <span className="flex items-center gap-4">
              <span className="font-mono text-xs text-teal">{String(index + 1).padStart(2, "0")}</span>
              <span className="font-display text-2xl transition-colors group-hover:text-teal md:text-3xl">{category.name}</span>
            </span>
            <span aria-hidden className="label">↗</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function CategoriesPage() {
  return (
    <>
      <Masthead />
      <main className="mx-auto min-h-[70vh] max-w-6xl px-5 py-14 md:px-8 md:py-20">
        <Link href="/" className="label transition-colors hover:text-teal">← Back to {PUBLICATION}</Link>
        <header className="mt-10">
          <p className="label">Index / subjects</p>
          <h1 className="mt-3 font-display text-5xl font-medium md:text-7xl">Categories</h1>
        </header>
        <Suspense fallback={<div className="mt-9 h-56 bg-ink-2" aria-label="Loading categories" />}>
          <CategoryIndex />
        </Suspense>
      </main>
      <footer className="mx-auto max-w-6xl border-t border-rule px-5 py-8 md:px-8">
        <Link href="/articles" className="label transition-colors hover:text-teal">Browse all articles ↗</Link>
      </footer>
    </>
  );
}
