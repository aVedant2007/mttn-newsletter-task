# Newsletter Project

Build the backend in Go first. Then build a frontend for it with Next.js and React.

---

## Part 1: Go Backend

### 1. Technology Stack

| Layer | Technology |
|---|---|
| Language | Go |
| HTTP server | Go standard library `net/http` |
| Router | `http.ServeMux` |
| Database | PostgreSQL |
| PostgreSQL driver/client | `pgx/v5` |
| Query generation | sqlc |
| Content format | Tiptap JSON |
| PostgreSQL content type | JSONB |
| UUID | PostgreSQL `gen_random_uuid()` |
| Configuration | Environment variables / `.env` |
| Database migrations | SQL migrations |

### 2. Project Structure

```
newsletter-backend/
│
├── cmd/
│   └── server/
│       └── main.go
│
├── internal/
│   ├── db/
│   │   ├── db.go
│   │   ├── models.go
│   │   └── querier.go
│   │
│   └── http/
│       ├── articles.go
│       ├── categories.go
│       ├── subscribers.go
│       └── comments.go
│
├── db/
│   ├── migrations/
│   │   ├── 001_init.sql
│   │   └── ...
│   │
│   └── queries/
│       ├── articles.sql
│       ├── categories.sql
│       ├── subscribers.sql
│       └── comments.sql
│
├── sqlc.yaml
├── .env
├── .env.example
├── .gitignore
├── go.mod
├── go.sum
└── README.md
```

### 3. Prerequisites

Install:

- Go
- PostgreSQL
- sqlc

Verify:

```
go version
psql --version
sqlc version
```

### 4. Database Schema

#### `articles`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `slug` | text (unique) | URL-friendly string |
| `title` | text | Required |
| `description` | text | Required |
| `contents` | JSONB | Tiptap content (required) |
| `cover_image` | text (nullable) | Optional image URL |
| `published_at` | timestamp | Optional |
| `tags` | text[] | Array of strings |
| `category_id` | UUID (nullable) | FK to `categories` |
| `status` | text | e.g. draft, published, archived |
| `type` | text | e.g. newsletter, update, etc. |
| `estimated_read_time` | integer | Minutes |
| `created_at` | timestamp | Default: now() |

#### `categories`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `name` | text | Unique |
| `slug` | text | Optional |

#### `subscribers`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `email` | text | Required and unique |
| `subscribed_at` | timestamp | Default: now() |
| `is_verified` | boolean | Default: false |
| `unsubscribe_token` | text | Optional for email link |

#### `comments`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `article_id` | UUID | FK to `articles` |
| `author_name` | text | Optional / anonymous allowed |
| `content` | text | Comment content |
| `created_at` | timestamp | Default: now() |

### 5. Routes to Implement

#### Articles

| Method | Route | Description |
|---|---|---|
| GET | `/articles` | List all published articles |
| GET | `/articles/all` | List all articles |
| GET | `/articles/{slug}` | Get article by slug |
| POST | `/articles` | Create new article |
| PUT | `/articles/{id}` | Update article |
| DELETE | `/articles/{id}` | Delete article |

#### Categories

| Method | Route | Description |
|---|---|---|
| GET | `/categories` | List all |
| POST | `/categories` | Create new |

#### Subscribers

| Method | Route | Description |
|---|---|---|
| POST | `/subscribe` | Subscribe by email |
| GET | `/subscribers` | List all |

#### Comments

| Method | Route | Description |
|---|---|---|
| GET | `/articles/{id}/comments` | List comments for article |
| POST | `/articles/{id}/comments` | Add a comment |

---

## Part 2: Next.js Frontend

### 1. Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| UI library | React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Rich text editor | Tiptap (`@tiptap/react`) |
| Data fetching | Native `fetch` |
| Backend | Newsletter Backend (Go + PostgreSQL) |
| Configuration | Environment variables / `.env.local` |
| Package manager | npm |

### 2. Project Structure

```
newsletter-frontend/
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   │
│   │   ├── articles/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   │
│   │   └── admin/
│   │       ├── page.tsx
│   │       ├── articles/
│   │       │   ├── new/
│   │       │   │   └── page.tsx
│   │       │   └── [id]/
│   │       │       └── edit/
│   │       │           └── page.tsx
│   │       ├── categories/
│   │       │   └── page.tsx
│   │       └── subscribers/
│   │           └── page.tsx
│   │
│   ├── components/
│   │   ├── ArticleCard.tsx
│   │   ├── ArticleForm.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── CommentForm.tsx
│   │   ├── CommentList.tsx
│   │   ├── SubscribeForm.tsx
│   │   ├── TiptapEditor.tsx
│   │   └── TiptapRenderer.tsx
│   │
│   └── lib/
│       ├── api.ts
│       └── types.ts
│
├── public/
├── .env.local
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

### 3. Prerequisites

Install:

- Node.js
- npm
- The Part 1 backend running locally

Verify:

```
node --version
npm --version
curl http://localhost:8080/articles
```

### 4. Frontend Guidelines

- Use the reference below as the inspiration for the frontend.
- The frontend should be clear.
- The influence of the reference should show in the final frontend site.
- Functionality is not required.
- Making it interactive is optional.

### 5. Reference

- https://in.pinterest.com/pin/395261304819007432/
- https://in.pinterest.com/pin/64176363434087665/

### 6. Creative Freedom

> ## 🎨 Creative Freedom
>
> **Beyond the points above, you have full creative freedom over how the frontend looks and feels.** Choose your own layout, colors, typography, spacing, animations and interactions.
>
> The structure above is a starting point. You may add pages, components, features or libraries that improve the result.
