"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import type { TiptapNode } from "../lib/articles";

const tools = [
  { label: "Paragraph", command: (editor: Editor) => editor.chain().focus().setParagraph().run(), active: () => false },
  { label: "Heading", command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: (editor: Editor) => editor.isActive("heading", { level: 2 }) },
  { label: "Bold", command: (editor: Editor) => editor.chain().focus().toggleBold().run(), active: (editor: Editor) => editor.isActive("bold") },
  { label: "Bullets", command: (editor: Editor) => editor.chain().focus().toggleBulletList().run(), active: (editor: Editor) => editor.isActive("bulletList") },
  { label: "Numbered list", command: (editor: Editor) => editor.chain().focus().toggleOrderedList().run(), active: (editor: Editor) => editor.isActive("orderedList") },
  { label: "Quote", command: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(), active: (editor: Editor) => editor.isActive("blockquote") },
  { label: "Code block", command: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run(), active: (editor: Editor) => editor.isActive("codeBlock") },
];

export default function TiptapEditor({ onChange }: { onChange: (content: TiptapNode) => void }) {
  const [, setSelectionVersion] = useState(0);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({ italic: false, strike: false })],
    content: { type: "doc", content: [{ type: "paragraph" }] },
    editorProps: {
      attributes: {
        class: "tiptap min-h-80 px-5 py-4 text-ivory/90 focus:outline-none",
        id: "article-body-editor",
        "aria-label": "Article body editor",
      },
    },
    onUpdate: ({ editor: updatedEditor }) => onChange(updatedEditor.getJSON() as TiptapNode),
    onSelectionUpdate: () => setSelectionVersion((version) => version + 1),
  });

  if (!editor) {
    return <div className="min-h-80 border border-rule bg-ink px-5 py-4 text-dim">Preparing editor…</div>;
  }

  return (
    <div className="article-editor border border-rule bg-ink focus-within:border-teal">
      <div className="flex flex-wrap gap-2 border-b border-rule p-3" role="toolbar" aria-label="Article formatting">
        {tools.map((tool) => (
          <button
            key={tool.label}
            type="button"
            aria-pressed={tool.active(editor)}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => tool.command(editor)}
            className={`border px-3 py-1.5 font-mono text-[0.625rem] uppercase tracking-[0.08em] transition-colors ${tool.active(editor) ? "border-teal text-teal" : "border-rule text-dim hover:border-teal hover:text-teal"}`}
          >
            {tool.label}
          </button>
        ))}
        <span className="ml-auto flex gap-2">
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="px-2 font-mono text-xs text-dim hover:text-ivory disabled:opacity-40" aria-label="Undo">↶</button>
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="px-2 font-mono text-xs text-dim hover:text-ivory disabled:opacity-40" aria-label="Redo">↷</button>
        </span>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
