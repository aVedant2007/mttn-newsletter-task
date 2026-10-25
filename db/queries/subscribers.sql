
-- name: CreateSubscriber :one
INSERT INTO subscribers (email)
VALUES ($1)
RETURNING
    id,
    email,
    subscribed_at,
    is_verified,
    unsubscribe_token;

-- name: ListSubscribers :many
SELECT
    id,
    email,
    subscribed_at,
    is_verified,
    unsubscribe_token
FROM subscribers
ORDER BY subscribed_at DESC;
