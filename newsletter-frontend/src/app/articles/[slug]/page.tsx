import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleContent from "../../components/ArticleContent";
import CommentThread from "../../components/CommentThread";
import Masthead from "../../components/Masthead";
import { formatDate, getPublishedArticle, type Article } from "../../lib/articles";

async function ArticleDetails({ slug }: { slug: string }) {
  let article: Article;
  try {
    article = await getPublishedArticle(slug);
  } catch (error) {
    if (typeof error === "object" && error !== null && "status" in error && error.status === 404) {
      notFound();
    }
    return (
      <main className="mx-auto min-h-[70vh] max-w-3xl px-5 py-16 md:px-8">
        <p className="label">The archive is temporarily unavailable</p>
        <p className="mt-4 text-dim">Please try loading this article again shortly.</p>
        <Link href="/articles" className="mt-8 inline-block text-teal underline underline-offset-4">Return to all articles</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
      <Link href="/articles" className="label transition-colors hover:text-teal">← All articles</Link>
      <article className="mx-auto mt-12 max-w-3xl">
        <p className="label">{article.category} · {article.readingTime} min read</p>
        <h1 className="mt-5 font-display text-5xl font-medium leading-[0.98] md:text-7xl">{article.title}</h1>
        <p className="mt-7 max-w-2xl text-xl leading-relaxed text-dim">{article.excerpt}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-rule py-4">
          <span className="text-sm">By <span className="text-teal">{article.author?.trim() || "Author unavailable"}</span></span>
          <time className="label" dateTime={article.date}>{formatDate(article.date)}</time>
          {article.tags?.length ? <span className="label">{article.tags.join(" · ")}</span> : null}
        </div>
        {article.coverImage ? (
          <figure className="my-10">
            <img src={article.coverImage} alt="" className="h-auto max-h-[36rem] w-full object-cover" />
          </figure>
        ) : null}
        {article.contents ? (
          <ArticleContent content={article.contents} />
        ) : (
          <p className="my-10 text-dim">The full text for this article is not available yet.</p>
        )}
      </article>
      <div className="mx-auto max-w-3xl">
        {article.id ? <CommentThread articleId={article.id} /> : null}
      </div>
    </main>
  );
}

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <>
      <Masthead />
      <Suspense fallback={<main className="mx-auto min-h-[70vh] max-w-3xl px-5 py-16 md:px-8"><div className="h-80 bg-ink-2" aria-label="Loading article" /></main>}>
        <ResolvedArticle params={params} />
      </Suspense>
    </>
  );
}

async function ResolvedArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ArticleDetails slug={slug} />;
}
