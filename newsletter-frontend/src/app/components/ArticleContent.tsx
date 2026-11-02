import { Fragment } from "react";
import type { TiptapNode } from "../lib/articles";

function renderText(node: TiptapNode, key: string) {
  let content: React.ReactNode = node.text ?? "";

  for (const mark of node.marks ?? []) {
    if (mark.type === "bold") content = <strong key={`${key}-bold`}>{content}</strong>;
    if (mark.type === "code") content = <code key={`${key}-code`} className="rounded bg-ink-2 px-1.5 py-0.5 font-mono text-[0.9em]">{content}</code>;
    if (mark.type === "link") {
      const href = mark.attrs?.href;
      if (typeof href === "string" && /^(https?:|mailto:|\/)/.test(href)) {
        content = <a key={`${key}-link`} href={href} className="text-teal underline decoration-teal/50 underline-offset-4">{content}</a>;
      }
    }
    // Italic marks are intentionally rendered upright to match the site's typography.
  }

  return <>{content}</>;
}

function renderNode(node: TiptapNode, key: string): React.ReactNode {
  if (node.type === "text") return <Fragment key={key}>{renderText(node, key)}</Fragment>;
  const children = node.content?.map((child, index) => renderNode(child, `${key}-${index}`));

  switch (node.type) {
    case "doc":
      return <Fragment key={key}>{children}</Fragment>;
    case "paragraph":
      return <p key={key} className="my-6 leading-[1.9] text-ivory/90">{children}</p>;
    case "heading": {
      const level = Number(node.attrs?.level);
      if (level === 1) return <h2 key={key} className="mb-5 mt-12 font-display text-4xl font-medium">{children}</h2>;
      if (level === 2) return <h2 key={key} className="mb-4 mt-10 font-display text-3xl font-medium">{children}</h2>;
      return <h3 key={key} className="mb-3 mt-8 font-display text-2xl font-medium">{children}</h3>;
    }
    case "bulletList":
      return <ul key={key} className="my-6 list-disc space-y-2 pl-7 text-ivory/90">{children}</ul>;
    case "orderedList":
      return <ol key={key} className="my-6 list-decimal space-y-2 pl-7 text-ivory/90">{children}</ol>;
    case "listItem":
      return <li key={key}>{children}</li>;
    case "blockquote":
      return <blockquote key={key} className="my-8 border-l-2 border-teal pl-6 text-xl text-dim">{children}</blockquote>;
    case "codeBlock":
      return <pre key={key} className="my-8 overflow-x-auto border border-rule bg-ink-2 p-5 font-mono text-sm"><code>{children}</code></pre>;
    case "hardBreak":
      return <br key={key} />;
    case "horizontalRule":
      return <hr key={key} className="my-10 border-rule" />;
    case "image": {
      const src = node.attrs?.src;
      if (typeof src !== "string" || !/^(https?:|\/)/.test(src)) return null;
      const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
      return <figure key={key} className="my-10"><img src={src} alt={alt} className="h-auto max-w-full" /><figcaption className="label mt-3">{alt}</figcaption></figure>;
    }
    default:
      return <Fragment key={key}>{children}</Fragment>;
  }
}

export default function ArticleContent({ content }: { content: TiptapNode }) {
  return <div className="article-content">{renderNode(content, "content")}</div>;
}
