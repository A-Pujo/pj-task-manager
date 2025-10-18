package repository

import (
	"context"
	"fmt"

	"github.com/A-Pujo/pj-task-manager/backend/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

// PenggunaRepository adalah struct yang handle database operations untuk entity Pengguna
type PenggunaRepository struct {
	db *pgxpool.Pool
}

// NewPenggunaRepository membuat instance baru dari PenggunaRepository
func NewPenggunaRepository(db *pgxpool.Pool) *PenggunaRepository {
	return &PenggunaRepository{db: db}
}

// GetAll mengambil semua pengguna dari database
func (r *PenggunaRepository) GetAll(ctx context.Context) ([]models.Pengguna, error) {
	query := `
		SELECT pengguna_id, nama_depan, nama_belakang, email, peran, is_aktif, 
		       dibuat_pada, terakhir_login, oauth_provider, oauth_uid, url_foto_profil
		FROM pengguna
		ORDER BY pengguna_id DESC
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query pengguna: %w", err)
	}
	defer rows.Close()

	var penggunas []models.Pengguna
	for rows.Next() {
		var p models.Pengguna
		err := rows.Scan(
			&p.PenggunaID,
			&p.NamaDepan,
			&p.NamaBelakang,
			&p.Email,
			&p.Peran,
			&p.IsAktif,
			&p.DibuatPada,
			&p.TerakhirLogin,
			&p.OAuthProvider,
			&p.OAuthUID,
			&p.URLFotoProfil,
		)
		if err != nil {
			return nil, fmt.Errorf("gagal scan row pengguna: %w", err)
		}
		penggunas = append(penggunas, p)
	}

	return penggunas, nil
}

// GetByID mengambil satu pengguna berdasarkan ID
func (r *PenggunaRepository) GetByID(ctx context.Context, id int) (*models.Pengguna, error) {
	query := `
		SELECT pengguna_id, nama_depan, nama_belakang, email, peran, is_aktif, 
		       dibuat_pada, terakhir_login, oauth_provider, oauth_uid, url_foto_profil
		FROM pengguna
		WHERE pengguna_id = $1
	`

	var p models.Pengguna
	err := r.db.QueryRow(ctx, query, id).Scan(
		&p.PenggunaID,
		&p.NamaDepan,
		&p.NamaBelakang,
		&p.Email,
		&p.Peran,
		&p.IsAktif,
		&p.DibuatPada,
		&p.TerakhirLogin,
		&p.OAuthProvider,
		&p.OAuthUID,
		&p.URLFotoProfil,
	)

	if err != nil {
		return nil, fmt.Errorf("pengguna tidak ditemukan: %w", err)
	}

	return &p, nil
}

// GetByEmail mengambil pengguna berdasarkan email
func (r *PenggunaRepository) GetByEmail(ctx context.Context, email string) (*models.Pengguna, error) {
	query := `
		SELECT pengguna_id, nama_depan, nama_belakang, email, peran, is_aktif, 
		       dibuat_pada, terakhir_login, oauth_provider, oauth_uid, url_foto_profil
		FROM pengguna
		WHERE email = $1
	`

	var p models.Pengguna
	err := r.db.QueryRow(ctx, query, email).Scan(
		&p.PenggunaID,
		&p.NamaDepan,
		&p.NamaBelakang,
		&p.Email,
		&p.Peran,
		&p.IsAktif,
		&p.DibuatPada,
		&p.TerakhirLogin,
		&p.OAuthProvider,
		&p.OAuthUID,
		&p.URLFotoProfil,
	)

	if err != nil {
		return nil, fmt.Errorf("pengguna dengan email %s tidak ditemukan: %w", email, err)
	}

	return &p, nil
}

// Create membuat pengguna baru
func (r *PenggunaRepository) Create(ctx context.Context, req models.PenggunaCreateRequest, hashedPassword string) (*models.Pengguna, error) {
	query := `
		INSERT INTO pengguna (nama_depan, nama_belakang, email, peran, kata_sandi_hash)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING pengguna_id, nama_depan, nama_belakang, email, peran, is_aktif, dibuat_pada
	`

	peran := req.Peran
	if peran == "" {
		peran = "Karyawan" // Default
	}

	var p models.Pengguna
	err := r.db.QueryRow(ctx, query,
		req.NamaDepan,
		req.NamaBelakang,
		req.Email,
		peran,
		hashedPassword,
	).Scan(
		&p.PenggunaID,
		&p.NamaDepan,
		&p.NamaBelakang,
		&p.Email,
		&p.Peran,
		&p.IsAktif,
		&p.DibuatPada,
	)

	if err != nil {
		return nil, fmt.Errorf("gagal create pengguna: %w", err)
	}

	return &p, nil
}

// Update mengupdate data pengguna
func (r *PenggunaRepository) Update(ctx context.Context, id int, req models.PenggunaUpdateRequest) (*models.Pengguna, error) {
	// Build dynamic query berdasarkan field yang di-update
	query := `UPDATE pengguna SET `
	params := []interface{}{}
	paramCount := 1

	if req.NamaDepan != nil {
		query += fmt.Sprintf("nama_depan = $%d, ", paramCount)
		params = append(params, *req.NamaDepan)
		paramCount++
	}
	if req.NamaBelakang != nil {
		query += fmt.Sprintf("nama_belakang = $%d, ", paramCount)
		params = append(params, *req.NamaBelakang)
		paramCount++
	}
	if req.Email != nil {
		query += fmt.Sprintf("email = $%d, ", paramCount)
		params = append(params, *req.Email)
		paramCount++
	}
	if req.Peran != nil {
		query += fmt.Sprintf("peran = $%d, ", paramCount)
		params = append(params, *req.Peran)
		paramCount++
	}
	if req.IsAktif != nil {
		query += fmt.Sprintf("is_aktif = $%d, ", paramCount)
		params = append(params, *req.IsAktif)
		paramCount++
	}

	// Remove trailing comma
	query = query[:len(query)-2]

	query += fmt.Sprintf(` WHERE pengguna_id = $%d
		RETURNING pengguna_id, nama_depan, nama_belakang, email, peran, is_aktif, dibuat_pada`, paramCount)
	params = append(params, id)

	var p models.Pengguna
	err := r.db.QueryRow(ctx, query, params...).Scan(
		&p.PenggunaID,
		&p.NamaDepan,
		&p.NamaBelakang,
		&p.Email,
		&p.Peran,
		&p.IsAktif,
		&p.DibuatPada,
	)

	if err != nil {
		return nil, fmt.Errorf("gagal update pengguna: %w", err)
	}

	return &p, nil
}

// Delete menghapus pengguna (soft delete dengan set is_aktif = false, atau hard delete)
func (r *PenggunaRepository) Delete(ctx context.Context, id int) error {
	// Soft delete: set is_aktif = false
	query := `UPDATE pengguna SET is_aktif = false WHERE pengguna_id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("gagal delete pengguna: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("pengguna dengan ID %d tidak ditemukan", id)
	}

	return nil
}

// HardDelete menghapus pengguna secara permanen dari database
func (r *PenggunaRepository) HardDelete(ctx context.Context, id int) error {
	query := `DELETE FROM pengguna WHERE pengguna_id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("gagal hard delete pengguna: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("pengguna dengan ID %d tidak ditemukan", id)
	}

	return nil
}

// GetByEmailWithPassword mengambil pengguna dengan password hash (untuk login)
func (r *PenggunaRepository) GetByEmailWithPassword(ctx context.Context, email string) (*models.Pengguna, error) {
	query := `
		SELECT pengguna_id, nama_depan, nama_belakang, email, peran, is_aktif, 
		       dibuat_pada, terakhir_login, kata_sandi_hash, oauth_provider, oauth_uid, url_foto_profil
		FROM pengguna
		WHERE email = $1
	`

	var p models.Pengguna
	err := r.db.QueryRow(ctx, query, email).Scan(
		&p.PenggunaID,
		&p.NamaDepan,
		&p.NamaBelakang,
		&p.Email,
		&p.Peran,
		&p.IsAktif,
		&p.DibuatPada,
		&p.TerakhirLogin,
		&p.KataSandiHash,
		&p.OAuthProvider,
		&p.OAuthUID,
		&p.URLFotoProfil,
	)

	if err != nil {
		return nil, fmt.Errorf("pengguna dengan email %s tidak ditemukan: %w", email, err)
	}

	return &p, nil
}

// UpdateLastLogin update timestamp terakhir login pengguna
func (r *PenggunaRepository) UpdateLastLogin(ctx context.Context, id int) error {
	query := `UPDATE pengguna SET terakhir_login = NOW() WHERE pengguna_id = $1`

	_, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("gagal update last login: %w", err)
	}

	return nil
}
