package api

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"newletter-task/internal/db"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

// ArticleResponse is the JSON representation returned by the API.
// Contents uses json.RawMessage so JSONB is returned as actual JSON.
type ArticleResponse struct {
	ID                pgtype.UUID        `json:"id"`
	Slug              string             `json:"slug"`
	Title             string             `json:"title"`
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
