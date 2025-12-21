package config

import (
	"log"
	"net"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

// Config aggregates application configuration.
type Config struct {
	App      AppConfig
	Postgres PostgresConfig
	Redis    RedisConfig
}

// AppConfig controls HTTP server settings.
type AppConfig struct {
	Host string
	Port string
}

// Addr returns host:port with sensible defaults if unset.
func (a AppConfig) Addr() string {
	host := defaultString(a.Host, "0.0.0.0")
	port := defaultString(a.Port, "8080")
	return net.JoinHostPort(host, port)
}

// PostgresConfig defines PostgreSQL connection tuning options.
type PostgresConfig struct {
	DSN             string
	MaxConns        int32
	MinConns        int32
	MaxConnLifetime time.Duration
}

// RedisConfig defines Redis client options.
type RedisConfig struct {
	Addr        string
	Password    string
	DB          int
	PoolSize    int
	DialTimeout time.Duration
}

// Load reads environment variables (optionally from .env) and returns a Config.
func Load() (Config, error) {
	// Attempt to load a local .env file for development. Missing file is ignored.
	if err := godotenv.Load(); err != nil && !os.IsNotExist(err) {
		log.Printf("config: unable to load .env: %v", err)
	}

	cfg := Config{
		App: AppConfig{
			Host: getEnv("APP_HOST", "0.0.0.0"),
			Port: getEnv("APP_PORT", "8080"),
		},
		Postgres: PostgresConfig{
			DSN:             getEnv("POSTGRES_DSN", ""),
			MaxConns:        getInt32Env("POSTGRES_MAX_CONNS", 10),
			MinConns:        getInt32Env("POSTGRES_MIN_CONNS", 2),
			MaxConnLifetime: getDurationEnv("POSTGRES_MAX_CONN_LIFETIME", time.Hour),
		},
		Redis: RedisConfig{
			Addr:        getEnv("REDIS_ADDR", "localhost:6379"),
			Password:    getEnv("REDIS_PASSWORD", ""),
			DB:          getIntEnv("REDIS_DB", 0),
			PoolSize:    getIntEnv("REDIS_POOL_SIZE", 10),
			DialTimeout: getDurationEnv("REDIS_DIAL_TIMEOUT", 5*time.Second),
		},
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func getIntEnv(key string, fallback int) int {
	raw, ok := os.LookupEnv(key)
	if !ok || raw == "" {
		return fallback
	}
	value, err := strconv.Atoi(raw)
	if err != nil {
		log.Printf("config: %s expects integer, got %q: %v (using %d)", key, raw, err, fallback)
		return fallback
	}
	return value
}

func getInt32Env(key string, fallback int32) int32 {
	raw, ok := os.LookupEnv(key)
	if !ok || raw == "" {
		return fallback
	}
	value, err := strconv.ParseInt(raw, 10, 32)
	if err != nil {
		log.Printf("config: %s expects int32, got %q: %v (using %d)", key, raw, err, fallback)
		return fallback
	}
	return int32(value)
}

func getDurationEnv(key string, fallback time.Duration) time.Duration {
	raw, ok := os.LookupEnv(key)
	if !ok || raw == "" {
		return fallback
	}
	value, err := time.ParseDuration(raw)
	if err != nil {
		log.Printf("config: %s expects duration, got %q: %v (using %s)", key, raw, err, fallback)
		return fallback
	}
	return value
}

func defaultString(value, fallback string) string {
	if value == "" {
		return fallback
	}
	return value
}
