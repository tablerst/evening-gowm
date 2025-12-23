package public

import (
	"net/http"
	"path"
	"strings"

	"evening-gown/internal/config"

	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
)

type AssetsHandler struct {
	minioClient *minio.Client
	minioCfg    config.MinioConfig
}

func NewAssetsHandler(minioClient *minio.Client, minioCfg config.MinioConfig) *AssetsHandler {
	return &AssetsHandler{minioClient: minioClient, minioCfg: minioCfg}
}

// Get streams an object from MinIO through the application.
//
// Route: GET /api/v1/assets/*key
//
// Notes:
// - Intended for public website consumption (published products).
// - Keeps MinIO buckets private; browsers never talk to MinIO directly.
func (h *AssetsHandler) Get(c *gin.Context) {
	if h == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "service unavailable"})
		return
	}
	if h.minioClient == nil || strings.TrimSpace(h.minioCfg.Endpoint) == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "minio disabled"})
		return
	}
	if strings.TrimSpace(h.minioCfg.Bucket) == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "minio bucket not configured"})
		return
	}

	key := strings.TrimPrefix(c.Param("key"), "/")
	key = strings.TrimSpace(key)
	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid key"})
		return
	}
	if strings.Contains(key, "\\") || strings.Contains(key, "\x00") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid key"})
		return
	}

	cleaned := path.Clean("/" + key)
	if strings.HasPrefix(cleaned, "/..") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid key"})
		return
	}
	cleanKey := strings.TrimPrefix(cleaned, "/")
	if cleanKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid key"})
		return
	}

	// Optional safety: only allow product assets for now.
	if !strings.HasPrefix(cleanKey, "products/") {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	ctx := c.Request.Context()

	stat, err := h.minioClient.StatObject(ctx, h.minioCfg.Bucket, cleanKey, minio.StatObjectOptions{})
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	obj, err := h.minioClient.GetObject(ctx, h.minioCfg.Bucket, cleanKey, minio.GetObjectOptions{})
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	defer obj.Close()

	contentType := strings.TrimSpace(stat.ContentType)
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	// Cache aggressively: object keys are content-addressed-ish (include uuid/date),
	// so updates generate new keys and won't break caches.
	headers := map[string]string{
		"Cache-Control": "public, max-age=31536000, immutable",
	}
	if strings.TrimSpace(stat.ETag) != "" {
		c.Header("ETag", stat.ETag)
	}

	c.DataFromReader(http.StatusOK, stat.Size, contentType, obj, headers)
}
