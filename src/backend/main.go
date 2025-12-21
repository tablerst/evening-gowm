package main

import (
	"log"

	"evening-gown/internal/app"
)

func main() {
	if err := app.Run(); err != nil {
		log.Fatalf("application exited with error: %v", err)
	}
}
