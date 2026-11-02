import Link from "next/link";
import { Article, formatDate } from "../lib/articles";

export default function ArticleRow({ article }: { article: Article }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group grid gap-2 border-t border-rule py-7 transition-colors hover:bg-ink-2/60 md:grid-cols-[9rem_1fr_auto] md:gap-8 md:px-3"
    >
      <div className="label pt-1.5">{formatDate(article.date)}</div>
      <div>
        <h3 className="font-display text-[1.75rem] font-medium leading-tight transition-colors group-hover:text-brass md:text-[2rem]">
          {article.title}
        </h3>
        <p className="mt-2 max-w-2xl text-dim">{article.excerpt}</p>
        <p className="mt-3 text-sm text-ivory">By {article.author?.trim() || "Author unavailable"}</p>
        <p className="label mt-3 md:hidden">
          {article.category} · {article.readingTime} min
        </p>
      </div>
      <div className="label hidden pt-1.5 text-right md:block">
        <div>{article.category}</div>
        <div className="mt-1">{article.readingTime} min read</div>
      </div>
    </Link>
  );
}
