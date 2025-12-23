package main

import (
	"log/slog"
	"os"

	"evening-gown/internal/app"
)

func main() {
	if err := app.Run(); err != nil {
		slog.Error("application exited with error", "err", err)
		os.Exit(1)
	}
}
