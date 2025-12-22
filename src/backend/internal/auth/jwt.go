package auth

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"evening-gown/internal/config"

	"github.com/golang-jwt/jwt/v5"
)

var (
	ErrJWTDisabled      = errors.New("jwt disabled")
	ErrJWTInvalidToken  = errors.New("invalid token")
	ErrJWTMissingToken  = errors.New("missing token")
	ErrJWTMissingSecret = errors.New("missing jwt secret")
)

type Service struct {
	cfg config.JWTConfig
	key []byte
}

func New(cfg config.JWTConfig) (*Service, error) {
	if strings.TrimSpace(cfg.Secret) == "" {
		return nil, ErrJWTMissingSecret
	}
	return &Service{cfg: cfg, key: []byte(cfg.Secret)}, nil
}

func (s *Service) IssueToken(subject string) (tokenString string, expiresAt time.Time, err error) {
	if s == nil {
		return "", time.Time{}, ErrJWTDisabled
	}
	if strings.TrimSpace(subject) == "" {
		return "", time.Time{}, fmt.Errorf("subject is empty")
	}

	now := time.Now()
	expiresAt = now.Add(s.cfg.ExpiresIn)

	claims := jwt.RegisteredClaims{
		Issuer:    s.cfg.Issuer,
		Subject:   subject,
		Audience:  jwt.ClaimStrings{},
		ExpiresAt: jwt.NewNumericDate(expiresAt),
		IssuedAt:  jwt.NewNumericDate(now),
		NotBefore: jwt.NewNumericDate(now.Add(-30 * time.Second)),
	}
	if strings.TrimSpace(s.cfg.Audience) != "" {
		claims.Audience = jwt.ClaimStrings{s.cfg.Audience}
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	ss, err := token.SignedString(s.key)
	if err != nil {
		return "", time.Time{}, fmt.Errorf("sign token: %w", err)
	}
	return ss, expiresAt, nil
}

func (s *Service) ParseToken(tokenString string) (*jwt.RegisteredClaims, error) {
	if s == nil {
		return nil, ErrJWTDisabled
	}
	tokenString = strings.TrimSpace(tokenString)
	if tokenString == "" {
		return nil, ErrJWTMissingToken
	}

	opts := []jwt.ParserOption{
		jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}),
	}
	if strings.TrimSpace(s.cfg.Issuer) != "" {
		opts = append(opts, jwt.WithIssuer(s.cfg.Issuer))
	}
	if strings.TrimSpace(s.cfg.Audience) != "" {
		opts = append(opts, jwt.WithAudience(s.cfg.Audience))
	}

	parsed, err := jwt.ParseWithClaims(tokenString, &jwt.RegisteredClaims{}, func(t *jwt.Token) (any, error) {
		// Prevent alg=none and other unexpected algorithms.
		if t.Method == nil || t.Method.Alg() != jwt.SigningMethodHS256.Alg() {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return s.key, nil
	}, opts...)
	if err != nil {
		return nil, fmt.Errorf("parse token: %w", err)
	}
	if parsed == nil || !parsed.Valid {
		return nil, ErrJWTInvalidToken
	}

	claims, ok := parsed.Claims.(*jwt.RegisteredClaims)
	if !ok || claims == nil {
		return nil, ErrJWTInvalidToken
	}

	return claims, nil
}
