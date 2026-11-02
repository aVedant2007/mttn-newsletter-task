package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"newletter-task/internal/db"
	api "newletter-task/internal/http"
	"time"
)

func main() {
	ctx := context.Background()

	pool, err := db.Connect(ctx)
	if err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}
	defer pool.Close()

	queries := db.New(pool)
	mux := http.NewServeMux()

	mux.Handle("GET /articles", api.ListPublishedArticles(queries))
	mux.Handle("POST /articles", api.CreateArticle(queries))
	mux.Handle("GET /articles/{slug}", api.GetArticleBySlug(queries))
	mux.Handle("GET /articles/all", api.ListAllArticles(queries))
	mux.Handle("PUT /articles/{id}", api.UpdateArticle(queries))
	mux.Handle("DELETE /articles/{id}", api.DeleteArticle(queries))

	mux.Handle("GET /categories", api.ListCategories(queries))
	mux.Handle("POST /categories", api.CreateCategory(queries))

	mux.Handle("POST /subscribe", api.Subscribe(queries))
	mux.Handle("GET /subscribers", api.ListSubscribers(queries))

	mux.Handle("GET /articles/{id}/comments", api.ListCommentsForArticle(queries))
	mux.Handle("POST /articles/{id}/comments", api.CreateComment(queries))

	mux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Welcome to the Newsletter Backend!")
	})

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status": "ok",
		})
	})

	mux.HandleFunc("GET /health/db", func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
		defer cancel()

		if err := pool.Ping(ctx); err != nil {
			http.Error(w, `{"status":"error","database":"unavailable"}`,
				http.StatusServiceUnavailable)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status":   "ok",
			"database": "connected",
		})
	})

	fmt.Println("Server running at http://localhost:8080")

	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}
