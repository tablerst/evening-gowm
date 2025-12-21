package router

import (
	"github.com/gin-gonic/gin"

	"evening-gown/internal/handler/health"
)

// Dependencies groups handlers required by the router.
type Dependencies struct {
	Health *health.Handler
}

// New builds a gin.Engine with common middleware and routes.
func New(deps Dependencies) *gin.Engine {
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	r.GET("/ping", deps.Health.Ping)
	r.GET("/healthz", deps.Health.Health)

	return r
}
