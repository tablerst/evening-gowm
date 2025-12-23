package middleware

import (
	"net/http"
	"runtime/debug"
	"strings"
	"time"

	"evening-gown/internal/logging"
	"evening-gown/internal/model"

	"github.com/gin-contrib/requestid"
	"github.com/gin-gonic/gin"
)

// RequestContextLogger injects a request-scoped slog logger into gin.Context.
//
// This enables handlers to log with request_id and other request fields.
func RequestContextLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		reqID := strings.TrimSpace(requestid.Get(c))

		l := logging.FromGin(c).With(
			"request_id", reqID,
			"method", c.Request.Method,
			"path", c.Request.URL.Path,
		)
		logging.SetGinLogger(c, l)

		c.Next()
	}
}

// AccessLogger logs one line per request with latency/status/request_id.
func AccessLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		latency := time.Since(start)

		status := c.Writer.Status()
		route := c.FullPath()
		if strings.TrimSpace(route) == "" {
			route = c.Request.URL.Path
		}

		l := logging.FromGin(c)
		args := []any{
			"status", status,
			"route", route,
			"latency_ms", latency.Milliseconds(),
			"client_ip", c.ClientIP(),
			"ua", c.Request.UserAgent(),
			"bytes", c.Writer.Size(),
		}
		if len(c.Errors) > 0 {
			args = append(args, "errors", c.Errors.String())
		}

		switch {
		case status >= 500:
			l.Error("http", args...)
		case status >= 400:
			l.Warn("http", args...)
		default:
			l.Info("http", args...)
		}
	}
}

// Recovery logs panics with stack traces (to file) and returns HTTP 500.
func Recovery() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered any) {
		l := logging.FromGin(c)
		l.Error("panic recovered",
			"panic", recovered,
			"stack", string(debug.Stack()),
			"status", http.StatusInternalServerError,
		)
		c.AbortWithStatus(http.StatusInternalServerError)
	})
}

// EnrichLoggerWithAdmin appends admin info (if available) to the request logger.
//
// This is intended to be called by auth middleware after the user is resolved.
func EnrichLoggerWithAdmin(c *gin.Context, user model.User) {
	if c == nil {
		return
	}
	logging.AppendGinLogger(c,
		"admin_id", user.ID,
		"admin_email", user.Email,
		"admin_role", user.Role,
	)
}
