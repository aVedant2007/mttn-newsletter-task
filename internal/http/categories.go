package api

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"newletter-task/internal/db"

	"github.com/jackc/pgx/v5/pgtype"
)

// ListCategories handles GET /categories.
func ListCategories(queries *db.Queries) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()

		categories, err := queries.ListCategories(ctx)
		if err != nil {
			log.Printf("list categories: %v", err)
			writeJSON(w, http.StatusInternalServerError, map[string]string{
				"error": "could not retrieve categories",
			})
			return
		}

		writeJSON(w, http.StatusOK, categories)
	}
}

// CreateCategoryRequest represents the JSON sent by the client.
type CreateCategoryRequest struct {
	Name string  `json:"name"`
	Slug *string `json:"slug"`
}

// CreateCategory handles POST /categories.
func CreateCategory(queries *db.Queries) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var request CreateCategoryRequest

		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{
				"error": "invalid JSON request body",
			})
			return
		}

		request.Name = strings.TrimSpace(request.Name)
		if request.Name == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{
				"error": "name is required",
			})
			return
		}

		// Convert the optional slug into pgtype.Text.
		var slug pgtype.Text
		if request.Slug != nil {
			slugValue := strings.TrimSpace(*request.Slug)
			if slugValue != "" {
				slug = pgtype.Text{
					String: slugValue,
					Valid:  true,
				}
			}
		}

		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()

		category, err := queries.CreateCategory(ctx, db.CreateCategoryParams{
			Name: request.Name,
			Slug: slug,
		})
		if err != nil {
			log.Printf("create category: %v", err)
			writeJSON(w, http.StatusInternalServerError, map[string]string{
				"error": "could not create category",
			})
			return
		}

		writeJSON(w, http.StatusCreated, category)
	}
}
