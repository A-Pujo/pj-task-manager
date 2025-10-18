package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/A-Pujo/pj-task-manager/backend/internal/config"
	"github.com/jackc/pgx/v5/pgxpool"
)

// DB adalah wrapper untuk connection pool database
type DB struct {
	Pool *pgxpool.Pool
}

// NewConnection membuat connection pool baru ke PostgreSQL
// Parameter:
//   - cfg: pointer ke Config yang berisi database credentials
//
// Returns:
//   - *DB: pointer ke DB struct yang berisi connection pool
//   - error: error jika koneksi gagal
func NewConnection(cfg *config.Config) (*DB, error) {
	// Context dengan timeout 10 detik untuk connection
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Connection pool configuration
	poolConfig, err := pgxpool.ParseConfig(cfg.GetDSN())
	if err != nil {
		return nil, fmt.Errorf("gagal parse database config: %w", err)
	}

	// Set connection pool settings
	poolConfig.MaxConns = 25                           // Maksimal 25 koneksi aktif
	poolConfig.MinConns = 5                            // Minimal 5 koneksi standby
	poolConfig.MaxConnLifetime = time.Hour             // Koneksi expired setelah 1 jam
	poolConfig.MaxConnIdleTime = 30 * time.Minute      // Koneksi idle ditutup setelah 30 menit
	poolConfig.HealthCheckPeriod = 1 * time.Minute     // Health check setiap 1 menit

	// Buat connection pool
	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		return nil, fmt.Errorf("gagal membuat connection pool: %w", err)
	}

	// Test koneksi dengan ping
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("gagal ping database: %w", err)
	}

	log.Println("✅ Database connection pool berhasil dibuat")

	return &DB{Pool: pool}, nil
}

// Close menutup semua koneksi di pool
// Harus dipanggil saat aplikasi shutdown
func (db *DB) Close() {
	if db.Pool != nil {
		db.Pool.Close()
		log.Println("🔌 Database connection pool ditutup")
	}
}

// Ping melakukan health check ke database
func (db *DB) Ping(ctx context.Context) error {
	return db.Pool.Ping(ctx)
}

// Stats mengembalikan statistik connection pool
// Berguna untuk monitoring
func (db *DB) Stats() *pgxpool.Stat {
	return db.Pool.Stat()
}
