import Link from "next/link";
import Masthead from "../../../components/Masthead";
import ArticleComposer from "../../../components/ArticleComposer";

export default function NewArticlePage() {
  return (
    <>
      <Masthead />
      <main className="mx-auto min-h-[70vh] max-w-4xl px-5 py-14 md:px-8 md:py-20">
        <Link href="/" className="label transition-colors hover:text-teal">← Back to publication</Link>
        <header className="mb-10 mt-10 border-b border-rule pb-7">
          <p className="label">Editorial desk / New article</p>
          <h1 className="mt-3 font-display text-5xl font-medium md:text-7xl">Write a story</h1>
          <p className="mt-4 max-w-xl text-dim">Save a draft to keep it off the public site, or publish it for readers.</p>
        </header>
        <ArticleComposer />
      </main>
    </>
  );
}
