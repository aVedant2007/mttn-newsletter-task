package api

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strings"
	"time"

	"newletter-task/internal/db"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
)

// CreateCommentRequest represents the JSON sent by the client.
type CreateCommentRequest struct {
	AuthorName *string `json:"author_name"`
	Content    string  `json:"content"`
}

// ListCommentsForArticle handles GET /articles/{id}/comments.
func ListCommentsForArticle(queries *db.Queries) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		articleIDText := r.PathValue("id")

		var articleID pgtype.UUID
		if err := articleID.Scan(articleIDText); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{
				"error": "invalid article ID",
			})
			return
		}

		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()

		comments, err := queries.ListCommentsForArticle(ctx, articleID)
		if err != nil {
			log.Printf("list comments: %v", err)
			writeJSON(w, http.StatusInternalServerError, map[string]string{
				"error": "could not retrieve comments",
			})
			return
		}

		writeJSON(w, http.StatusOK, comments)
	}
}

// CreateComment handles POST /articles/{id}/comments.
func CreateComment(queries *db.Queries) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		articleIDText := r.PathValue("id")

		var articleID pgtype.UUID
		if err := articleID.Scan(articleIDText); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{
				"error": "invalid article ID",
			})
			return
		}

		var request CreateCommentRequest
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{
				"error": "invalid JSON request body",
			})
			return
		}

		request.Content = strings.TrimSpace(request.Content)
		if request.Content == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{
				"error": "comment content is required",
			})
			return
		}

		var authorName pgtype.Text
		if request.AuthorName != nil {
			name := strings.TrimSpace(*request.AuthorName)
			if name != "" {
				authorName = pgtype.Text{
					String: name,
					Valid:  true,
				}
			}
		}

		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()

		comment, err := queries.CreateComment(ctx, db.CreateCommentParams{
			ArticleID:  articleID,
			AuthorName: authorName,
			Content:    request.Content,
		})
		if err != nil {
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) && pgErr.Code == "23503" {
				writeJSON(w, http.StatusNotFound, map[string]string{
					"error": "article not found",
				})
				return
			}

			log.Printf("create comment: %v", err)
			writeJSON(w, http.StatusInternalServerError, map[string]string{
				"error": "could not create comment",
			})
			return
		}

		writeJSON(w, http.StatusCreated, comment)
	}
}
