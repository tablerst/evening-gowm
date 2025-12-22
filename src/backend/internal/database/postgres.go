package database

import (
	"context"
	"errors"
	"fmt"
	"time"

	"evening-gown/internal/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// New opens a PostgreSQL connection via Gorm and verifies connectivity.
func New(ctx context.Context, cfg config.PostgresConfig) (*gorm.DB, error) {
	if cfg.DSN == "" {
		return nil, errors.New("postgres DSN is empty")
	}

	db, err := gorm.Open(postgres.Open(cfg.DSN), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("open postgres with gorm: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("get sql.DB from gorm: %w", err)
	}

	if cfg.MaxConns > 0 {
		sqlDB.SetMaxOpenConns(int(cfg.MaxConns))
	}
	if cfg.MinConns > 0 {
		sqlDB.SetMaxIdleConns(int(cfg.MinConns))
	}
	if cfg.MaxConnLifetime > 0 {
		sqlDB.SetConnMaxLifetime(cfg.MaxConnLifetime)
	}

	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	if err := sqlDB.PingContext(pingCtx); err != nil {
		_ = sqlDB.Close()
		return nil, fmt.Errorf("ping postgres: %w", err)
	}

	return db, nil
}

// Close closes the underlying sql.DB used by Gorm.
func Close(db *gorm.DB) error {
	if db == nil {
		return nil
	}
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
