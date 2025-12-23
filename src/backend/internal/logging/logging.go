package logging

import (
	"fmt"
	"io"
	"log/slog"
	"os"
	"path/filepath"
	"strings"

	"evening-gown/internal/config"

	"gopkg.in/natefinch/lumberjack.v2"
)

// Init configures the global default slog logger.
//
// It writes logs to cfg.Dir/cfg.File with rotation enabled by default.
// Optionally, it also mirrors logs to stdout.
func Init(cfg config.LogConfig) (*slog.Logger, func() error, error) {
	dir := strings.TrimSpace(cfg.Dir)
	if dir == "" {
		dir = "logs"
	}
	file := strings.TrimSpace(cfg.File)
	if file == "" {
		file = "app.log"
	}

	absDir, err := filepath.Abs(dir)
	if err != nil {
		absDir = dir
	}
	if err := os.MkdirAll(absDir, 0o755); err != nil {
		return nil, nil, fmt.Errorf("create log dir %s: %w", absDir, err)
	}

	lj := &lumberjack.Logger{
		Filename:   filepath.Join(absDir, file),
		MaxSize:    defaultInt(cfg.MaxSizeMB, 50),
		MaxBackups: defaultInt(cfg.MaxBackups, 10),
		MaxAge:     defaultInt(cfg.MaxAgeDays, 14),
		Compress:   cfg.Compress,
		LocalTime:  true,
	}

	var out io.Writer = lj
	if cfg.ToStdout {
		out = io.MultiWriter(os.Stdout, lj)
	}

	level := parseLevel(cfg.Level)
	opts := &slog.HandlerOptions{AddSource: true, Level: level}

	format := strings.ToLower(strings.TrimSpace(cfg.Format))
	var h slog.Handler
	switch format {
	case "text":
		h = slog.NewTextHandler(out, opts)
	default:
		h = slog.NewJSONHandler(out, opts)
	}

	logger := slog.New(h).With("service", "evening-gown")
	slog.SetDefault(logger)

	cleanup := func() error {
		return lj.Close()
	}

	return logger, cleanup, nil
}

func defaultInt(v int, fallback int) int {
	if v <= 0 {
		return fallback
	}
	return v
}

func parseLevel(raw string) slog.Level {
	s := strings.ToLower(strings.TrimSpace(raw))
	switch s {
	case "debug":
		return slog.LevelDebug
	case "warn", "warning":
		return slog.LevelWarn
	case "error":
		return slog.LevelError
	case "info", "":
		fallthrough
	default:
		return slog.LevelInfo
	}
}
