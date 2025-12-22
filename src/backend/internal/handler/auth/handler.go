package auth

import (
	"net/http"
	"strings"

	"evening-gown/internal/auth"
	"evening-gown/internal/config"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc *auth.Service
}

func New(cfg config.JWTConfig) *Handler {
	svc, err := auth.New(cfg)
	if err != nil {
		// cfg.JWT.Secret 为空时上层会禁用；这里兜底。
		return &Handler{svc: nil}
	}
	return &Handler{svc: svc}
}

type issueTokenRequest struct {
	Subject string `json:"sub" binding:"required"`
}

// IssueToken issues a HS256 JWT.
func (h *Handler) IssueToken(c *gin.Context) {
	if h == nil || h.svc == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "jwt disabled"})
		return
	}

	var req issueTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	token, exp, err := h.svc.IssueToken(req.Subject)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":      token,
		"expires_at": exp.UTC().Format("2006-01-02T15:04:05Z07:00"),
	})
}

// VerifyToken validates a JWT and returns its registered claims.
func (h *Handler) VerifyToken(c *gin.Context) {
	if h == nil || h.svc == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "jwt disabled"})
		return
	}

	tokenString := tokenFromRequest(c)
	claims, err := h.svc.ParseToken(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"valid": true,
		"claims": gin.H{
			"iss": claims.Issuer,
			"sub": claims.Subject,
			"aud": claims.Audience,
			"exp": claims.ExpiresAt,
			"iat": claims.IssuedAt,
			"nbf": claims.NotBefore,
			"jti": claims.ID,
		},
	})
}

func tokenFromRequest(c *gin.Context) string {
	if c == nil {
		return ""
	}
	if token := strings.TrimSpace(c.Query("token")); token != "" {
		return token
	}

	authz := strings.TrimSpace(c.GetHeader("Authorization"))
	parts := strings.SplitN(authz, " ", 2)
	if len(parts) == 2 && strings.EqualFold(parts[0], "Bearer") {
		return strings.TrimSpace(parts[1])
	}
	return ""
}
