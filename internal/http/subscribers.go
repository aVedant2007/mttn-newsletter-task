package api

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"net/mail"
	"strings"
	"time"

	"newletter-task/internal/db"

	"github.com/jackc/pgx/v5/pgconn"
)

// SubscribeRequest represents the JSON sent by someone subscribing.
type SubscribeRequest struct {
	Email string `json:"email"`
}

// Subscribe handles POST /subscribe.
func Subscribe(queries *db.Queries) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var request SubscribeRequest

		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{
				"error": "invalid JSON request body",
			})
			return
		}

		email := strings.TrimSpace(request.Email)
		if _, err := mail.ParseAddress(email); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{
				"error": "a valid email address is required",
			})
			return
		}

		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()

		subscriber, err := queries.CreateSubscriber(ctx, email)
		if err != nil {
			// PostgreSQL error code 23505 means unique constraint violation.
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) && pgErr.Code == "23505" {
				writeJSON(w, http.StatusConflict, map[string]string{
					"error": "this email is already subscribed",
				})
				return
			}

			log.Printf("create subscriber: %v", err)
			writeJSON(w, http.StatusInternalServerError, map[string]string{
				"error": "could not subscribe",
			})
			return
		}

		writeJSON(w, http.StatusCreated, subscriber)
	}
}

// ListSubscribers handles GET /subscribers.
// NOTE: Protect this route with admin authentication before production.
func ListSubscribers(queries *db.Queries) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()

		subscribers, err := queries.ListSubscribers(ctx)
		if err != nil {
			log.Printf("list subscribers: %v", err)
			writeJSON(w, http.StatusInternalServerError, map[string]string{
				"error": "could not retrieve subscribers",
			})
			return
		}

		writeJSON(w, http.StatusOK, subscribers)
	}
}
