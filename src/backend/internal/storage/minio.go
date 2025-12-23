package storage

import (
	"context"
	"fmt"
	"io"
	"net/url"
	"strings"
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

func EnsureBucket(ctx context.Context, client *minio.Client, cfg config.MinioConfig) error {
	if client == nil {
		return fmt.Errorf("minio client is nil")
	}
	if strings.TrimSpace(cfg.Bucket) == "" {
		return fmt.Errorf("minio bucket is not set (MINIO_BUCKET)")
	}

	exists, err := client.BucketExists(ctx, cfg.Bucket)
	if err != nil {
		return fmt.Errorf("check bucket exists: %w", err)
	}
	if exists {
		return nil
	}

	if err := client.MakeBucket(ctx, cfg.Bucket, minio.MakeBucketOptions{Region: cfg.Region}); err != nil {
		// Race-safe: if another instance created it, BucketExists will succeed.
		exists, checkErr := client.BucketExists(ctx, cfg.Bucket)
		if checkErr == nil && exists {
			return nil
		}
		return fmt.Errorf("create bucket %q: %w", cfg.Bucket, err)
	}

	return nil
}

func PutObject(ctx context.Context, client *minio.Client, cfg config.MinioConfig, objectKey string, r io.Reader, size int64, contentType string) error {
	objectKey = strings.TrimSpace(strings.TrimPrefix(objectKey, "/"))
	if objectKey == "" {
		return fmt.Errorf("objectKey is empty")
	}
	if size <= 0 {
		return fmt.Errorf("invalid object size")
	}

	if err := EnsureBucket(ctx, client, cfg); err != nil {
		return err
	}

	_, err := client.PutObject(ctx, cfg.Bucket, objectKey, r, size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return fmt.Errorf("put object: %w", err)
	}
	return nil
}

func PublicObjectURL(cfg config.MinioConfig, objectKey string) (string, error) {
	objectKey = strings.TrimSpace(strings.TrimPrefix(objectKey, "/"))
	if objectKey == "" {
		return "", fmt.Errorf("objectKey is empty")
	}
	if strings.TrimSpace(cfg.Bucket) == "" {
		return "", fmt.Errorf("minio bucket is not set (MINIO_BUCKET)")
	}

	base := strings.TrimSpace(cfg.PublicBaseURL)
	if base == "" {
		endpoint := strings.TrimSpace(strings.TrimSuffix(cfg.Endpoint, "/"))
		if endpoint == "" {
			return "", fmt.Errorf("minio endpoint is not set")
		}
		scheme := "http"
		if cfg.UseSSL {
			scheme = "https"
		}
		base = scheme + "://" + endpoint
	} else {
		base = strings.TrimSuffix(base, "/")
		// Allow values like "cdn.example.com" without scheme.
		if !strings.Contains(base, "://") {
			base = "https://" + base
		}
	}

	u, err := url.Parse(base)
	if err != nil {
		return "", fmt.Errorf("parse public base url: %w", err)
	}
	if u.Scheme == "" || u.Host == "" {
		return "", fmt.Errorf("invalid public base url: %q", base)
	}

	pathPrefix := strings.TrimSuffix(u.Path, "/")
	u.Path = pathPrefix + "/" + cfg.Bucket + "/" + objectKey
	return u.String(), nil
}
