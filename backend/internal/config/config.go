package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config menyimpan semua konfigurasi aplikasi yang dibaca dari environment variables
type Config struct {
	// Server configuration
	Port string

	// Database configuration
	DBHost     string
	DBPort     int
	DBUser     string
	DBPassword string
	DBName     string

	// JWT configuration
	JWTSecret          string
	JWTExpirationHours int
}

// Load membaca file .env dan memuat semua konfigurasi
// Returns: pointer ke Config struct dan error jika ada
func Load() (*Config, error) {
	// Load .env file
	// godotenv.Load() akan mencari file .env di current directory
	if err := godotenv.Load(); err != nil {
		// Jika .env tidak ditemukan, tidak masalah (bisa pakai system env vars)
		fmt.Println("Warning: .env file not found, using system environment variables")
	}

	// Parse DB Port dari string ke integer
	dbPort, err := strconv.Atoi(getEnv("PG_DB_PORT", "5432"))
	if err != nil {
		return nil, fmt.Errorf("invalid PG_DB_PORT: %w", err)
	}

	// Parse JWT Expiration Hours
	jwtExpHours, err := strconv.Atoi(getEnv("JWT_EXPIRATION_HOURS", "24"))
	if err != nil {
		return nil, fmt.Errorf("invalid JWT_EXPIRATION_HOURS: %w", err)
	}

	// Buat Config struct dengan nilai dari environment
	config := &Config{
		Port:               getEnv("PORT", "8080"),
		DBHost:             getEnv("PG_DB_HOST", "localhost"),
		DBPort:             dbPort,
		DBUser:             getEnv("PG_DB_USER", "postgres"),
		DBPassword:         getEnv("PG_DB_PASSWORD", ""),
		DBName:             getEnv("PG_DB_NAME", "pm"),
		JWTSecret:          getEnv("JWT_SECRET", "default-secret-key"),
		JWTExpirationHours: jwtExpHours,
	}

	// Validasi: password tidak boleh kosong
	if config.DBPassword == "" {
		return nil, fmt.Errorf("PG_DB_PASSWORD tidak boleh kosong")
	}

	// Validasi: JWT secret harus ada untuk production
	if config.JWTSecret == "default-secret-key" {
		fmt.Println("⚠️  Warning: Using default JWT secret. Change JWT_SECRET in production!")
	}

	return config, nil
}

// getEnv adalah helper function untuk membaca environment variable
// Jika tidak ada, return default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// GetDSN membuat Database Source Name (connection string) untuk PostgreSQL
// Format: postgres://user:password@host:port/database
func (c *Config) GetDSN() string {
	return fmt.Sprintf(
		"postgres://%s:%s@%s:%d/%s?sslmode=disable",
		c.DBUser,
		c.DBPassword,
		c.DBHost,
		c.DBPort,
		c.DBName,
	)
}
