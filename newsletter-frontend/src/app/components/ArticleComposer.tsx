"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Category } from "../lib/articles";
import type { TiptapNode } from "../lib/articles";

const TiptapEditor = dynamic(() => import("./TiptapEditor"), {
  ssr: false,
  loading: () => <div className="min-h-80 border border-rule bg-ink px-5 py-4 text-dim">Loading editor…</div>,
});

type SaveStatus = "idle" | "saving" | "saved";
type SavedArticle = { slug: string; status: "draft" | "published" };

function slugFromTitle(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function toLocalDateTime(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function hasArticleText(node: TiptapNode | null): boolean {
  if (!node) return false;
  if (node.text?.trim()) return true;
  return Boolean(node.content?.some((child) => hasArticleText(child)));
}

export default function ArticleComposer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState<TiptapNode | null>(null);
  const [type, setType] = useState("newsletter");
  const [readingTime, setReadingTime] = useState(5);
  const [categoryId, setCategoryId] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [saving, setSaving] = useState<SaveStatus>("idle");
  const [savedArticle, setSavedArticle] = useState<SavedArticle | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setPublishedAt(toLocalDateTime(new Date()));
    fetch("/api/categories")
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load categories");
        return response.json() as Promise<Category[] | null>;
      })
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  function updateTitle(value: string) {
    setTitle(value);
    if (!slugEdited) setSlug(slugFromTitle(value));
  }

  async function saveArticle(status: "draft" | "published") {
    setError("");
    if (!title.trim() || !slug.trim() || !author.trim() || !description.trim() || !hasArticleText(content)) {
      setError("Add a title, URL slug, author, description, and article body before saving.");
      return;
    }

    setSaving("saving");
    try {
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slug.trim(),
          title: title.trim(),
          author: author.trim(),
          description: description.trim(),
          contents: content,
          cover_image: coverImage.trim() || null,
          published_at: status === "published" ? new Date(publishedAt || Date.now()).toISOString() : null,
          tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          category_id: categoryId || null,
          status,
          type: type.trim() || "newsletter",
          estimated_read_time: Math.max(1, Number(readingTime) || 1),
        }),
      });

      const result = await response.json().catch(() => null) as { slug?: string; error?: string } | null;
      if (!response.ok) {
        if (result?.error === "could not create article") {
          throw new Error("The backend could not save the article. Check the Go server logs and confirm the database migrations are applied.");
        }
        throw new Error(result?.error || `Could not save article (${response.status}).`);
      }
      setSavedArticle({ slug: result?.slug || slug, status });
      setSaving("saved");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save this article.");
      setSaving("idle");
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void saveArticle("published");
  }

  if (savedArticle) {
    return (
      <div className="border border-rule bg-ink-2 p-7 md:p-10" role="status">
        <p className="label">{savedArticle.status === "published" ? "Published" : "Draft saved"}</p>
        <h2 className="mt-3 font-display text-3xl font-medium">
          {savedArticle.status === "published" ? "Your article is live." : "Your draft is saved."}
        </h2>
        <div className="mt-7 flex flex-wrap gap-4">
          {savedArticle.status === "published" ? (
            <Link href={`/articles/${savedArticle.slug}`} className="bg-signal px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] text-black transition-colors hover:bg-teal">
              View article ↗
            </Link>
          ) : null}
          <Link href="/" className="border border-rule px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] text-ivory transition-colors hover:border-teal hover:text-teal">
            Return to the homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-7">
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Article title" htmlFor="article-title">
          <input id="article-title" required value={title} onChange={(event) => updateTitle(event.target.value)} maxLength={180} className={inputClass} placeholder="A title worth opening" />
        </Field>
        <Field label="Author" htmlFor="article-author">
          <input id="article-author" required value={author} onChange={(event) => setAuthor(event.target.value)} maxLength={120} className={inputClass} placeholder="Author name" />
        </Field>
      </div>

      <Field label="URL slug" htmlFor="article-slug" help="Used in the public article URL.">
        <input id="article-slug" required value={slug} onChange={(event) => { setSlug(event.target.value); setSlugEdited(true); }} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className={inputClass} placeholder="article-title" />
      </Field>

      <Field label="Short description" htmlFor="article-description">
        <textarea id="article-description" required value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} rows={3} className={inputClass} placeholder="A short introduction for the article listing." />
      </Field>

      <div className="grid gap-2">
        <label className="label" htmlFor="article-body-editor">Article body</label>
        <TiptapEditor onChange={setContent} />
        <p className="text-sm text-dim">Format with headings, bold text, lists, quotes, and code blocks.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Category" htmlFor="article-category">
          <select id="article-category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className={inputClass}>
            <option value="">No category</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </Field>
        <Field label="Tags" htmlFor="article-tags" help="Separate tags with commas.">
          <input id="article-tags" value={tags} onChange={(event) => setTags(event.target.value)} className={inputClass} placeholder="essay, culture" />
        </Field>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Cover image URL" htmlFor="article-cover">
          <input id="article-cover" type="url" value={coverImage} onChange={(event) => setCoverImage(event.target.value)} className={inputClass} placeholder="https://…" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Type" htmlFor="article-type">
            <input id="article-type" required value={type} onChange={(event) => setType(event.target.value)} className={inputClass} />
          </Field>
          <Field label="Read time (min)" htmlFor="article-reading-time">
            <input id="article-reading-time" type="number" min={1} required value={readingTime} onChange={(event) => setReadingTime(Number(event.target.value))} className={inputClass} />
          </Field>
        </div>
      </div>

      <Field label="Publish date and time" htmlFor="article-published-at" help="Used when publishing; drafts do not appear in the public article list.">
        <input id="article-published-at" type="datetime-local" value={publishedAt} onChange={(event) => setPublishedAt(event.target.value)} className={inputClass} />
      </Field>

      {error ? <p role="alert" className="border border-[#a55446]/50 bg-[#a55446]/10 px-4 py-3 text-sm text-[#e6a89a]">{error}</p> : null}

      <div className="flex flex-wrap gap-3 border-t border-rule pt-6">
        <button type="button" disabled={saving === "saving"} onClick={() => void saveArticle("draft")} className="border border-rule px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] text-ivory transition-colors hover:border-teal hover:text-teal disabled:opacity-60">
          {saving === "saving" ? "Saving…" : "Save draft"}
        </button>
        <button type="submit" disabled={saving === "saving"} className="bg-signal px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] text-black transition-colors hover:bg-teal disabled:opacity-60">
          {saving === "saving" ? "Publishing…" : "Publish article"}
        </button>
      </div>
    </form>
  );
}

const inputClass = "w-full border border-rule bg-ink px-4 py-3 text-ivory placeholder:text-dim/70 focus:border-teal focus:outline-none";

function Field({ label, htmlFor, help, children }: { label: string; htmlFor: string; help?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <label htmlFor={htmlFor} className="label">{label}</label>
      {children}
      {help ? <p className="text-sm text-dim">{help}</p> : null}
    </div>
  );
}
