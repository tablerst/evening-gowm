package cache

import (
	"context"
	"fmt"
	"time"

	"evening-gown/internal/config"

	"github.com/redis/go-redis/v9"
)

// NewClient builds a Redis client and verifies connectivity.
func NewClient(ctx context.Context, cfg config.RedisConfig) (*redis.Client, error) {
	if cfg.Addr == "" {
		return nil, fmt.Errorf("redis address is empty")
	}

	client := redis.NewClient(&redis.Options{
		Addr:        cfg.Addr,
		Password:    cfg.Password,
		DB:          cfg.DB,
		PoolSize:    cfg.PoolSize,
		DialTimeout: cfg.DialTimeout,
	})

	pingCtx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	if err := client.Ping(pingCtx).Err(); err != nil {
		_ = client.Close()
		return nil, fmt.Errorf("ping redis: %w", err)
	}

	return client, nil
}
