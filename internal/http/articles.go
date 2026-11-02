package api

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"newletter-task/internal/db"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
)

// ArticleResponse is the JSON representation returned by the API.
// Contents uses json.RawMessage so JSONB is returned as actual JSON.
type ArticleResponse struct {
	ID                pgtype.UUID        `json:"id"`
	Slug              string             `json:"slug"`
	Title             string             `json:"title"`
	Author            string             `json:"author"`
	Description       string             `json:"description"`
	Contents          json.RawMessage    `json:"contents"`
	CoverImage        pgtype.Text        `json:"cover_image"`
	PublishedAt       pgtype.Timestamptz `json:"published_at"`
	Tags              []string           `json:"tags"`
	CategoryID        pgtype.UUID        `json:"category_id"`
	Status            string             `json:"status"`
	Type              string             `json:"type"`
	EstimatedReadTime int32              `json:"estimated_read_time"`
	CreatedAt         pgtype.Timestamptz `json:"created_at"`
}

// ListPublishedArticles handles GET /articles.
func ListPublishedArticles(queries *db.Queries) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()

		articles, err := queries.ListPublishedArticles(ctx)
		if err != nil {
			log.Printf("list published articles: %v", err)
			writeJSON(w, http.StatusInternalServerError, map[string]string{
				"error": "could not retrieve articles",
			})
			return
		}

		response := make([]ArticleResponse, 0, len(articles))

		for _, article := range articles {
			response = append(response, ArticleResponse{
				ID:                article.ID,
				Slug:              article.Slug,
				Title:             article.Title,
				Author:            article.Author,
				Description:       article.Description,
				Contents:          json.RawMessage(article.Contents),
				CoverImage:        article.CoverImage,
				PublishedAt:       article.PublishedAt,
				Tags:              article.Tags,
				CategoryID:        article.CategoryID,
				Status:            article.Status,
				Type:              article.Type,
				EstimatedReadTime: article.EstimatedReadTime,
				CreatedAt:         article.CreatedAt,
			})
		}

		writeJSON(w, http.StatusOK, response)
	}
}

// writeJSON sends a JSON response with the given HTTP status.
func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("encode JSON response: %v", err)
	}
}

type CreateArticleRequest struct {
	Slug              string          `json:"slug"`
	Title             string          `json:"title"`
	Author            string          `json:"author"`
	Description       string          `json:"description"`
	Contents          json.RawMessage `json:"contents"`
	CoverImage        *string         `json:"cover_image"`
	PublishedAt       *time.Time      `json:"published_at"`
	Tags              []string        `json:"tags"`
	CategoryID        *string         `json:"category_id"`
	Status            string          `json:"status"`
	Type              string          `json:"type"`
	EstimatedReadTime int32           `json:"estimated_read_time"`
}

func CreateArticle(queries *db.Queries) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var request CreateArticleRequest

		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{
				"error": "invalid JSON request body",
			})
			return
		}

		// Trim whitespace from text fields.
		request.Slug = strings.TrimSpace(request.Slug)
		request.Title = strings.TrimSpace(request.Title)
		request.Author = strings.TrimSpace(request.Author)
		request.Description = strings.TrimSpace(request.Description)
		request.Status = strings.TrimSpace(request.Status)
		request.Type = strings.TrimSpace(request.Type)

		// Validate required fields.
		if request.Slug == "" || request.Title == "" || request.Author == "" ||
			request.Description == "" || len(request.Contents) == 0 ||
			request.Status == "" || request.Type == "" ||
			request.EstimatedReadTime <= 0 {
			writeJSON(w, http.StatusBadRequest, map[string]string{
				"error": "slug, title, author, description, contents, status, type, and positive estimated_read_time are required",
			})
			return
		}

		// Make sure contents contains valid JSON.
		if !json.Valid(request.Contents) {
			writeJSON(w, http.StatusBadRequest, map[string]string{
				"error": "contents must be valid JSON",
			})
			return
		}

		// Convert optional cover image to pgtype.Text.
		var coverImage pgtype.Text
		if request.CoverImage != nil {
			value := strings.TrimSpace(*request.CoverImage)
			if value != "" {
				coverImage = pgtype.Text{
					String: value,
					Valid:  true,
				}
			}
		}

		// Convert optional published_at to pgtype.Timestamptz.
		var publishedAt pgtype.Timestamptz
		if request.PublishedAt != nil {
			publishedAt = pgtype.Timestamptz{
				Time:  *request.PublishedAt,
				Valid: true,
			}
		}

		// Convert optional category ID to pgtype.UUID.
		var categoryID pgtype.UUID
		if request.CategoryID != nil {
			categoryText := strings.TrimSpace(*request.CategoryID)
			if categoryText != "" {
				if err := categoryID.Scan(categoryText); err != nil {
					writeJSON(w, http.StatusBadRequest, map[string]string{
						"error": "invalid category_id",
					})
					return
				}
			}
		}

		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()

		article, err := queries.CreateArticle(ctx, db.CreateArticleParams{
			Slug:              request.Slug,
			Title:             request.Title,
			Author:            request.Author,
			Description:       request.Description,
			Contents:          request.Contents,
			CoverImage:        coverImage,
			PublishedAt:       publishedAt,
			Tags:              request.Tags,
			CategoryID:        categoryID,
			Status:            request.Status,
			Type:              request.Type,
			EstimatedReadTime: request.EstimatedReadTime,
		})

		if err != nil {
			var pgErr *pgconn.PgError

			// PostgreSQL error 23505 means unique constraint violation.
			if errors.As(err, &pgErr) && pgErr.Code == "23505" {
				writeJSON(w, http.StatusConflict, map[string]string{
					"error": "an article with this slug already exists",
				})
				return
			}

			// PostgreSQL error 23503 means foreign key violation.
			if errors.As(err, &pgErr) && pgErr.Code == "23503" {
				writeJSON(w, http.StatusBadRequest, map[string]string{
					"error": "invalid category_id",
				})
				return
			}

			log.Printf("create article: %v", err)
			writeJSON(w, http.StatusInternalServerError, map[string]string{
				"error": "could not create article",
			})
			return
		}

		response := ArticleResponse{
			ID:                article.ID,
			Slug:              article.Slug,
			Title:             article.Title,
			Author:            article.Author,
			Description:       article.Description,
			Contents:          json.RawMessage(article.Contents),
			CoverImage:        article.CoverImage,
			PublishedAt:       article.PublishedAt,
			Tags:              article.Tags,
			CategoryID:        article.CategoryID,
			Status:            article.Status,
			Type:              article.Type,
			EstimatedReadTime: article.EstimatedReadTime,
			CreatedAt:         article.CreatedAt,
		}

		writeJSON(w, http.StatusCreated, response)
	}
}

func GetArticleBySlug(queries *db.Queries) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		slug := r.PathValue("slug")

		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()

		article, err := queries.GetArticleBySlug(ctx, slug)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				writeJSON(w, http.StatusNotFound, map[string]string{
					"error": "article not found",
				})
				return
			}

			log.Printf("get article by slug: %v", err)
			writeJSON(w, http.StatusInternalServerError, map[string]string{
				"error": "could not retrieve article",
			})
			return
		}

		response := ArticleResponse{
			ID:                article.ID,
			Slug:              article.Slug,
			Title:             article.Title,
			Author:            article.Author,
			Description:       article.Description,
			Contents:          json.RawMessage(article.Contents),
			CoverImage:        article.CoverImage,
			PublishedAt:       article.PublishedAt,
			Tags:              article.Tags,
			CategoryID:        article.CategoryID,
			Status:            article.Status,
			Type:              article.Type,
			EstimatedReadTime: article.EstimatedReadTime,
			CreatedAt:         article.CreatedAt,
		}

		writeJSON(w, http.StatusOK, response)
	}
}

// ListAllArticles returns all articles, including drafts and archived articles.
func ListAllArticles(queries *db.Queries) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()

		articles, err := queries.ListAllArticles(ctx)
		if err != nil {
			log.Printf("list all articles: %v", err)
			writeJSON(w, http.StatusInternalServerError, map[string]string{
				"error": "could not retrieve articles",
			})
			return
		}

		response := make([]ArticleResponse, 0, len(articles))

		for _, article := range articles {
			response = append(response, ArticleResponse{
				ID:                article.ID,
				Slug:              article.Slug,
				Title:             article.Title,
				Author:            article.Author,
				Description:       article.Description,
				Contents:          json.RawMessage(article.Contents),
				CoverImage:        article.CoverImage,
				PublishedAt:       article.PublishedAt,
				Tags:              article.Tags,
				CategoryID:        article.CategoryID,
				Status:            article.Status,
				Type:              article.Type,
				EstimatedReadTime: article.EstimatedReadTime,
				CreatedAt:         article.CreatedAt,
			})
		}

		writeJSON(w, http.StatusOK, response)
	}
}
func UpdateArticle(queries *db.Queries) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Extract article UUID from /articles/{id}.
		var articleID pgtype.UUID
		if err := articleID.Scan(r.PathValue("id")); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{
				"error": "invalid article ID",
			})
			return
		}

		var request CreateArticleRequest

		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{
				"error": "invalid JSON request body",
			})
			return
		}

		request.Slug = strings.TrimSpace(request.Slug)
		request.Title = strings.TrimSpace(request.Title)
		request.Author = strings.TrimSpace(request.Author)
		request.Description = strings.TrimSpace(request.Description)
		request.Status = strings.TrimSpace(request.Status)
		request.Type = strings.TrimSpace(request.Type)

		if request.Slug == "" || request.Title == "" || request.Author == "" ||
			request.Description == "" || len(request.Contents) == 0 ||
			request.Status == "" || request.Type == "" ||
			request.EstimatedReadTime <= 0 {
			writeJSON(w, http.StatusBadRequest, map[string]string{
				"error": "slug, title, author, description, contents, status, type, and positive estimated_read_time are required",
			})
			return
		}

		if !json.Valid(request.Contents) {
			writeJSON(w, http.StatusBadRequest, map[string]string{
				"error": "contents must be valid JSON",
			})
			return
		}

		var coverImage pgtype.Text
		if request.CoverImage != nil && strings.TrimSpace(*request.CoverImage) != "" {
			coverImage = pgtype.Text{
				String: strings.TrimSpace(*request.CoverImage),
				Valid:  true,
			}
		}

		var publishedAt pgtype.Timestamptz
		if request.PublishedAt != nil {
			publishedAt = pgtype.Timestamptz{
				Time:  *request.PublishedAt,
				Valid: true,
			}
		}

		var categoryID pgtype.UUID
		if request.CategoryID != nil && strings.TrimSpace(*request.CategoryID) != "" {
			if err := categoryID.Scan(strings.TrimSpace(*request.CategoryID)); err != nil {
				writeJSON(w, http.StatusBadRequest, map[string]string{
					"error": "invalid category_id",
				})
				return
			}
		}

		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()

		article, err := queries.UpdateArticle(ctx, db.UpdateArticleParams{
			ID:                articleID,
			Slug:              request.Slug,
			Title:             request.Title,
			Author:            request.Author,
			Description:       request.Description,
			Contents:          request.Contents,
			CoverImage:        coverImage,
			PublishedAt:       publishedAt,
			Tags:              request.Tags,
			CategoryID:        categoryID,
			Status:            request.Status,
			Type:              request.Type,
			EstimatedReadTime: request.EstimatedReadTime,
		})

		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				writeJSON(w, http.StatusNotFound, map[string]string{
					"error": "article not found",
				})
				return
			}

			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) && pgErr.Code == "23505" {
				writeJSON(w, http.StatusConflict, map[string]string{
					"error": "an article with this slug already exists",
				})
				return
			}

			log.Printf("update article: %v", err)
			writeJSON(w, http.StatusInternalServerError, map[string]string{
				"error": "could not update article",
			})
			return
		}

		response := ArticleResponse{
			ID:                article.ID,
			Slug:              article.Slug,
			Title:             article.Title,
			Author:            article.Author,
			Description:       article.Description,
			Contents:          json.RawMessage(article.Contents),
			CoverImage:        article.CoverImage,
			PublishedAt:       article.PublishedAt,
			Tags:              article.Tags,
			CategoryID:        article.CategoryID,
			Status:            article.Status,
			Type:              article.Type,
			EstimatedReadTime: article.EstimatedReadTime,
			CreatedAt:         article.CreatedAt,
		}

		writeJSON(w, http.StatusOK, response)
	}
}
func DeleteArticle(queries *db.Queries) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var articleID pgtype.UUID
		if err := articleID.Scan(r.PathValue("id")); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{
				"error": "invalid article ID",
			})
			return
		}

		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()

		rowsDeleted, err := queries.DeleteArticle(ctx, articleID)
		if err != nil {
			log.Printf("delete article: %v", err)
			writeJSON(w, http.StatusInternalServerError, map[string]string{
				"error": "could not delete article",
			})
			return
		}

		if rowsDeleted == 0 {
			writeJSON(w, http.StatusNotFound, map[string]string{
				"error": "article not found",
			})
			return
		}

		// 204 means successful deletion, with no response body.
		w.WriteHeader(http.StatusNoContent)
	}
}
