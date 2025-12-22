package storage

import (
	"context"
	"fmt"
	"time"

	"evening-gown/internal/config"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

// NewClient creates a MinIO (S3 compatible) client and verifies connectivity.
// If cfg.Endpoint is empty, it returns (nil, nil) meaning MinIO is disabled.
func NewClient(ctx context.Context, cfg config.MinioConfig) (*minio.Client, error) {
	if cfg.Endpoint == "" {
		return nil, nil
	}
	if cfg.AccessKey == "" || cfg.SecretKey == "" {
		return nil, fmt.Errorf("minio credentials are not set (MINIO_ACCESS_KEY/MINIO_SECRET_KEY)")
	}

	client, err := minio.New(cfg.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.AccessKey, cfg.SecretKey, ""),
		Secure: cfg.UseSSL,
		Region: cfg.Region,
	})
	if err != nil {
		return nil, fmt.Errorf("create minio client: %w", err)
	}

	checkCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	if _, err := client.ListBuckets(checkCtx); err != nil {
		return nil, fmt.Errorf("ping minio: %w", err)
	}

	return client, nil
}
