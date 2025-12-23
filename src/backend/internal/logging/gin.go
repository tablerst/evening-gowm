package logging

import (
	"log/slog"

	"github.com/gin-gonic/gin"
)

const ginLoggerKey = "logging.logger"

// SetGinLogger stores the request-scoped logger in gin.Context.
func SetGinLogger(c *gin.Context, l *slog.Logger) {
	if c == nil || l == nil {
		return
	}
	c.Set(ginLoggerKey, l)
}

// FromGin returns the request-scoped logger if present, otherwise slog.Default().
func FromGin(c *gin.Context) *slog.Logger {
	if c == nil {
		return slog.Default()
	}
	v, ok := c.Get(ginLoggerKey)
	if !ok {
		return slog.Default()
	}
	l, ok := v.(*slog.Logger)
	if !ok || l == nil {
		return slog.Default()
	}
	return l
}

// AppendGinLogger appends fields to the current request logger and stores it back.
func AppendGinLogger(c *gin.Context, args ...any) *slog.Logger {
	l := FromGin(c)
	if c == nil {
		return l.With(args...)
	}
	l = l.With(args...)
	SetGinLogger(c, l)
	return l
}
