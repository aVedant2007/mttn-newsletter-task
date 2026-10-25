
-- name: ListPublishedArticles :many
SELECT
    id,
    slug,
    title,
    description,
    contents,
    cover_image,
    published_at,
    tags,
    category_id,
    status,
    type,
    estimated_read_time,
    created_at
FROM articles
WHERE status = 'published'
  AND published_at IS NOT NULL
ORDER BY published_at DESC;

-- name: GetArticleBySlug :one
SELECT
    id,
    slug,
    title,
    description,
    contents,
    cover_image,
    published_at,
    tags,
    category_id,
    status,
    type,
    estimated_read_time,
    created_at
FROM articles
WHERE slug = $1
LIMIT 1;
