package app

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"evening-gown/internal/cache"
	"evening-gown/internal/config"
	"evening-gown/internal/database"
	"evening-gown/internal/handler/health"
	"evening-gown/internal/router"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

// Run wires dependencies and starts the HTTP server with graceful shutdown.
func Run() error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	var db *pgxpool.Pool
	if cfg.Postgres.DSN != "" {
		db, err = database.NewPool(ctx, cfg.Postgres)
		if err != nil {
			return err
		}
		defer db.Close()
	} else {
		log.Println("postgres disabled: POSTGRES_DSN not set")
	}

	var redisClient *redis.Client
	if cfg.Redis.Addr != "" {
		redisClient, err = cache.NewClient(ctx, cfg.Redis)
		if err != nil {
			return err
		}
		defer func() {
			if err := redisClient.Close(); err != nil {
				log.Printf("redis close error: %v", err)
			}
		}()
	} else {
		log.Println("redis disabled: REDIS_ADDR not set")
	}

	healthHandler := health.New(db, redisClient)
	r := router.New(router.Dependencies{Health: healthHandler})

	srv := &http.Server{
		Addr:    cfg.App.Addr(),
		Handler: r,
	}

	go func() {
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		if err := srv.Shutdown(shutdownCtx); err != nil {
			log.Printf("server shutdown error: %v", err)
		}
	}()

	log.Printf("HTTP server listening on %s", srv.Addr)
	if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		return err
	}

	return nil
}
