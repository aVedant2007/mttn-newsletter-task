-- name: ListCommentsForArticle :many
SELECT
    id,
    article_id,
    author_name,
    content,
    created_at
FROM comments
WHERE article_id = $1
ORDER BY created_at ASC;

-- name: CreateComment :one
INSERT INTO comments (article_id, author_name, content)
VALUES ($1, $2, $3)
RETURNING
    id,
    article_id,
    author_name,
    content,
    created_at;
