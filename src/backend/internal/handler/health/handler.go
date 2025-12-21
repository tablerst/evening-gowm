package health

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

// Handler bundles health endpoints dependencies.
type Handler struct {
	DB    *pgxpool.Pool
	Cache *redis.Client
}

func New(db *pgxpool.Pool, cache *redis.Client) *Handler {
	return &Handler{DB: db, Cache: cache}
}

// Ping is a lightweight liveness endpoint.
func (h *Handler) Ping(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "pong"})
}

// Health reports dependency health (PostgreSQL and Redis).
func (h *Handler) Health(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()

	checks := gin.H{}
	status := http.StatusOK

	if h.DB != nil {
		if err := h.DB.Ping(ctx); err != nil {
			status = http.StatusServiceUnavailable
			checks["postgres"] = "error: " + err.Error()
		} else {
			checks["postgres"] = "ok"
		}
	} else {
		checks["postgres"] = "disabled"
	}

	if h.Cache != nil {
		if err := h.Cache.Ping(ctx).Err(); err != nil {
			status = http.StatusServiceUnavailable
			checks["redis"] = "error: " + err.Error()
		} else {
			checks["redis"] = "ok"
		}
	} else {
		checks["redis"] = "disabled"
	}

	c.JSON(status, gin.H{
		"status": http.StatusText(status),
		"checks": checks,
	})
}
