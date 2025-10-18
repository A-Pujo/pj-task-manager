package utils

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWTClaims adalah struktur untuk JWT claims (payload)
type JWTClaims struct {
	PenggunaID int    `json:"pengguna_id"`
	Email      string `json:"email"`
	Peran      string `json:"peran"`
	jwt.RegisteredClaims
}

// GenerateJWT membuat JWT token untuk user
// Parameters:
//   - penggunaID: ID pengguna
//   - email: email pengguna
//   - peran: role pengguna (Admin, Developer, Karyawan)
//   - secret: JWT secret key dari config
//   - expirationHours: berapa jam token valid
//
// Returns: token string dan error
func GenerateJWT(penggunaID int, email, peran, secret string, expirationHours int) (string, error) {
	// Set expiration time
	expirationTime := time.Now().Add(time.Duration(expirationHours) * time.Hour)

	// Create claims
	claims := &JWTClaims{
		PenggunaID: penggunaID,
		Email:      email,
		Peran:      peran,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "pj-task-manager",
		},
	}

	// Create token dengan HS256 signing method
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign token dengan secret key
	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", fmt.Errorf("gagal generate token: %w", err)
	}

	return tokenString, nil
}

// ValidateJWT memvalidasi JWT token
// Parameters:
//   - tokenString: JWT token string dari header Authorization
//   - secret: JWT secret key dari config
//
// Returns: claims jika valid, error jika tidak valid
func ValidateJWT(tokenString, secret string) (*JWTClaims, error) {
	// Parse token
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Validasi signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("gagal parse token: %w", err)
	}

	// Extract claims
	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("token tidak valid")
}
