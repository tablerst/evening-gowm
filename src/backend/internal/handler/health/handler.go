package health

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

// Handler bundles health endpoints dependencies.
type Handler struct {
	DB          *gorm.DB
	Cache       *redis.Client
	ObjectStore *minio.Client
}

func New(db *gorm.DB, cache *redis.Client, objectStore *minio.Client) *Handler {
	return &Handler{DB: db, Cache: cache, ObjectStore: objectStore}
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
		sqlDB, err := h.DB.DB()
		if err != nil {
			status = http.StatusServiceUnavailable
			checks["postgres"] = "error: " + err.Error()
		} else if err := sqlDB.PingContext(ctx); err != nil {
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

	if h.ObjectStore != nil {
		if _, err := h.ObjectStore.ListBuckets(ctx); err != nil {
			status = http.StatusServiceUnavailable
			checks["minio"] = "error: " + err.Error()
		} else {
			checks["minio"] = "ok"
		}
	} else {
		checks["minio"] = "disabled"
	}

	c.JSON(status, gin.H{
		"status": http.StatusText(status),
		"checks": checks,
	})
}
