package logging

import (
	"log/slog"
	"runtime/debug"
)

// ErrorWithStack logs an error with a stack trace at the call site.
//
// Note: For best signal/noise, use this for unexpected failures (typically 5xx).
func ErrorWithStack(l *slog.Logger, msg string, err error, args ...any) {
	if l == nil {
		l = slog.Default()
	}
	if err == nil {
		l.Error(msg, append(args, "stack", string(debug.Stack()))...)
		return
	}
	l.Error(msg, append([]any{"err", err, "stack", string(debug.Stack())}, args...)...)
}
