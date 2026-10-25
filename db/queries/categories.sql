
-- name: ListCategories :many
SELECT id, name, slug
FROM categories
ORDER BY name ASC;

-- name: CreateCategory :one
INSERT INTO categories (name, slug)
VALUES ($1, $2)
RETURNING id, name, slug;
