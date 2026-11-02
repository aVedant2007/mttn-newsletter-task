export const API_BASE =
  process.env.NEWSLETTER_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080";
export const PUBLICATION = "Marginalia";

export type Article = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  readingTime: number; // minutes
  date: string; // ISO
  tone: "ochre" | "oxblood" | "moss" | "slate" | "bone";
  coverImage?: string | null;
  tags?: string[];
  contents?: TiptapNode;
};

export type TiptapNode = {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  content?: TiptapNode[];
};

export type ApiArticle = {
  id: string;
  slug: string;
  title: string;
  author: string;
  description: string;
  contents: TiptapNode;
  cover_image: string | null;
  published_at: string | null;
  tags: string[];
  category_id: string | null;
  estimated_read_time: number;
  created_at: string;
};

export type Category = { id: string; name: string; slug: string | null };

const TONES: Article["tone"][] = ["ochre", "slate", "oxblood", "moss", "bone"];

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!response.ok) {
    const error = new Error(`Newsletter API returned ${response.status}`);
    Object.assign(error, { status: response.status });
    throw error;
  }
  return response.json() as Promise<T>;
}

function normalizeArticle(article: ApiArticle, categories: Map<string, string>, index: number): Article {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.description,
    category: (article.category_id && categories.get(article.category_id)) || article.tags?.[0] || "Dispatch",
    author: article.author,
    readingTime: article.estimated_read_time,
    date: article.published_at ?? article.created_at,
    tone: TONES[index % TONES.length],
    coverImage: article.cover_image,
    tags: article.tags,
    contents: article.contents,
  };
}

export async function getPublishedArticles(): Promise<Article[]> {
  const [articles, categories] = await Promise.all([
    apiFetch<ApiArticle[]>("/articles"),
    getCategories().catch(() => []),
  ]);
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  return articles.map((article, index) => normalizeArticle(article, categoryNames, index));
}

export async function getPublishedArticle(slug: string): Promise<Article> {
  const [article, categories] = await Promise.all([
    apiFetch<ApiArticle>(`/articles/${encodeURIComponent(slug)}`),
    getCategories().catch(() => []),
  ]);
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  return normalizeArticle(article, categoryNames, 0);
}

export async function getCategories(): Promise<Category[]> {
  const categories = await apiFetch<Category[] | null>("/categories");
  return Array.isArray(categories) ? categories : [];
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
