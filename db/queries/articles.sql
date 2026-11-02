
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

-- name: CreateArticle :one
INSERT INTO articles (
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
    estimated_read_time
)
VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
)
RETURNING
    id, slug, title, description, contents, cover_image, published_at,
    tags, category_id, status, type, estimated_read_time, created_at;

-- name: ListAllArticles :many
SELECT
    id, slug, title, description, contents, cover_image, published_at,
    tags, category_id, status, type, estimated_read_time, created_at
FROM articles
ORDER BY created_at DESC;


-- name: UpdateArticle :one
UPDATE articles
SET
    slug = sqlc.arg(slug),
    title = sqlc.arg(title),
    description = sqlc.arg(description),
    contents = sqlc.arg(contents),
    cover_image = sqlc.arg(cover_image),
    published_at = sqlc.arg(published_at),
    tags = sqlc.arg(tags),
    category_id = sqlc.arg(category_id),
    status = sqlc.arg(status),
    type = sqlc.arg(type),
    estimated_read_time = sqlc.arg(estimated_read_time)
WHERE id = sqlc.arg(id)
RETURNING
    id, slug, title, description, contents, cover_image, published_at,
    tags, category_id, status, type, estimated_read_time, created_at;


-- name: DeleteArticle :execrows
DELETE FROM articles
WHERE id = sqlc.arg(id); 