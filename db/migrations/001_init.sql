
-- db/migrations/001_init.sql

-- 1. Categories must exist before articles can reference them.
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE
);

-- 2. Newsletter articles.
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    contents JSONB NOT NULL,
    cover_image TEXT,
    published_at TIMESTAMPTZ,
    tags TEXT[] NOT NULL DEFAULT '{}',
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published', 'archived')),
    type TEXT NOT NULL,
    estimated_read_time INTEGER NOT NULL DEFAULT 1
        CHECK (estimated_read_time > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Newsletter subscribers.
CREATE TABLE subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    unsubscribe_token TEXT UNIQUE
);

-- 4. Comments on articles.
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL
        REFERENCES articles(id) ON DELETE CASCADE,
    author_name TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes to speed up common lookups.
CREATE INDEX idx_articles_published_at
    ON articles(published_at DESC);

CREATE INDEX idx_articles_category_id
    ON articles(category_id);

CREATE INDEX idx_comments_article_id_created_at
    ON comments(article_id, created_at);