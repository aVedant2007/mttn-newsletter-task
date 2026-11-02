"use client";

import { useEffect, useState, type FormEvent } from "react";
import { formatDate } from "../lib/articles";

type Comment = {
  id: string;
  author_name: string | null;
  content: string;
  created_at: string;
};

export default function CommentThread({ articleId }: { articleId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`/api/articles/${encodeURIComponent(articleId)}/comments`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Comments could not be loaded.");
        return response.json() as Promise<Comment[] | null>;
      })
      .then((data) => { if (active) setComments(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setError("Comments could not be loaded right now."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [articleId]);

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");
    try {
      const response = await fetch(`/api/articles/${encodeURIComponent(articleId)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author_name: authorName.trim() || null, content: content.trim() }),
      });
      if (!response.ok) throw new Error("Your comment could not be posted. Please try again.");
      const comment = await response.json() as Comment;
      setComments((current) => [...current, comment]);
      setContent("");
    } catch {
      setError("Your comment could not be posted. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mt-20 border-t border-rule pt-10" aria-labelledby="comments-heading">
      <p className="label">Reader notes</p>
      <h2 id="comments-heading" className="mt-3 font-display text-4xl font-medium">Comments <span className="font-mono text-base text-dim">({comments.length})</span></h2>

      <form onSubmit={submitComment} className="mt-8 grid gap-4 border border-rule bg-ink-2 p-5 md:p-7">
        <label className="label" htmlFor="comment-author">Name <span className="normal-case tracking-normal">(optional)</span></label>
        <input id="comment-author" value={authorName} onChange={(event) => setAuthorName(event.target.value)} maxLength={100} placeholder="Your name" className="border border-rule bg-ink px-4 py-3 text-ivory placeholder:text-dim/70 focus:border-teal focus:outline-none" />
        <label className="label" htmlFor="comment-content">Your comment</label>
        <textarea id="comment-content" required value={content} onChange={(event) => setContent(event.target.value)} maxLength={5000} rows={4} placeholder="Add to the conversation…" className="resize-y border border-rule bg-ink px-4 py-3 text-ivory placeholder:text-dim/70 focus:border-teal focus:outline-none" />
        {error && <p role="alert" className="text-sm text-[#e6a89a]">{error}</p>}
        <button type="submit" disabled={sending} className="w-fit bg-signal px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] text-black transition-colors hover:bg-teal disabled:opacity-60">
          {sending ? "Posting…" : "Post comment"}
        </button>
      </form>

      <div className="mt-10 divide-y divide-rule border-y border-rule">
        {loading ? <p className="py-6 text-dim">Loading comments…</p> : null}
        {!loading && comments.length === 0 ? <p className="py-6 text-dim">No comments yet. Add the first note.</p> : null}
        {comments.map((comment) => (
          <article key={comment.id} className="py-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="font-display text-xl font-medium">{comment.author_name || "Anonymous reader"}</h3>
              <time className="label" dateTime={comment.created_at}>{formatDate(comment.created_at)}</time>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-ivory/85">{comment.content}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
