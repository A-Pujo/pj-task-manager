package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/A-Pujo/pj-task-manager/backend/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

// TugasRepository handle database operations untuk Tugas
type TugasRepository struct {
	db *pgxpool.Pool
}

// NewTugasRepository membuat instance baru
func NewTugasRepository(db *pgxpool.Pool) *TugasRepository {
	return &TugasRepository{db: db}
}

// GetAll mengambil semua tugas
func (r *TugasRepository) GetAll(ctx context.Context) ([]models.Tugas, error) {
	query := `
		SELECT tugas_id, proyek_id, nama_tugas, deskripsi, prioritas, status,
		       tanggal_mulai, tanggal_deadline, dibuat_pada, diperbarui_pada
		FROM tugas
		ORDER BY tugas_id DESC
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query tugas: %w", err)
	}
	defer rows.Close()

	var tugass []models.Tugas
	for rows.Next() {
		var t models.Tugas
		err := rows.Scan(
			&t.TugasID,
			&t.ProyekID,
			&t.NamaTugas,
			&t.Deskripsi,
			&t.Prioritas,
			&t.Status,
			&t.TanggalMulai,
			&t.TanggalDeadline,
			&t.DibuatPada,
			&t.DiperbaruiPada,
		)
		if err != nil {
			return nil, fmt.Errorf("gagal scan row tugas: %w", err)
		}
		tugass = append(tugass, t)
	}

	return tugass, nil
}

// GetByID mengambil tugas by ID
func (r *TugasRepository) GetByID(ctx context.Context, id int) (*models.Tugas, error) {
	query := `
		SELECT tugas_id, proyek_id, nama_tugas, deskripsi, prioritas, status,
		       tanggal_mulai, tanggal_deadline, dibuat_pada, diperbarui_pada
		FROM tugas
		WHERE tugas_id = $1
	`

	var t models.Tugas
	err := r.db.QueryRow(ctx, query, id).Scan(
		&t.TugasID,
		&t.ProyekID,
		&t.NamaTugas,
		&t.Deskripsi,
		&t.Prioritas,
		&t.Status,
		&t.TanggalMulai,
		&t.TanggalDeadline,
		&t.DibuatPada,
		&t.DiperbaruiPada,
	)

	if err != nil {
		return nil, fmt.Errorf("tugas tidak ditemukan: %w", err)
	}

	return &t, nil
}

// GetByProyekID mengambil semua tugas dalam satu proyek
func (r *TugasRepository) GetByProyekID(ctx context.Context, proyekID int) ([]models.Tugas, error) {
	query := `
		SELECT tugas_id, proyek_id, nama_tugas, deskripsi, prioritas, status,
		       tanggal_mulai, tanggal_deadline, dibuat_pada, diperbarui_pada
		FROM tugas
		WHERE proyek_id = $1
		ORDER BY tugas_id DESC
	`

	rows, err := r.db.Query(ctx, query, proyekID)
	if err != nil {
		return nil, fmt.Errorf("gagal query tugas by proyek: %w", err)
	}
	defer rows.Close()

	var tugass []models.Tugas
	for rows.Next() {
		var t models.Tugas
		err := rows.Scan(
			&t.TugasID,
			&t.ProyekID,
			&t.NamaTugas,
			&t.Deskripsi,
			&t.Prioritas,
			&t.Status,
			&t.TanggalMulai,
			&t.TanggalDeadline,
			&t.DibuatPada,
			&t.DiperbaruiPada,
		)
		if err != nil {
			return nil, fmt.Errorf("gagal scan row tugas: %w", err)
		}
		tugass = append(tugass, t)
	}

	return tugass, nil
}

// Create membuat tugas baru
func (r *TugasRepository) Create(ctx context.Context, req models.TugasCreateRequest) (*models.Tugas, error) {
	query := `
		INSERT INTO tugas (proyek_id, nama_tugas, deskripsi, prioritas, status, tanggal_mulai, tanggal_deadline)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING tugas_id, proyek_id, nama_tugas, deskripsi, prioritas, status, 
		          tanggal_mulai, tanggal_deadline, dibuat_pada, diperbarui_pada
	`

	var tanggalMulai *time.Time
	if req.TanggalMulai != nil {
		t, err := time.Parse("2006-01-02", *req.TanggalMulai)
		if err != nil {
			return nil, fmt.Errorf("format tanggal_mulai tidak valid: %w", err)
		}
		tanggalMulai = &t
	}

	var tanggalDeadline *time.Time
	if req.TanggalDeadline != nil {
		t, err := time.Parse("2006-01-02", *req.TanggalDeadline)
		if err != nil {
			return nil, fmt.Errorf("format tanggal_deadline tidak valid: %w", err)
		}
		tanggalDeadline = &t
	}

	prioritas := req.Prioritas
	if prioritas == "" {
		prioritas = "Sedang"
	}

	status := req.Status
	if status == "" {
		status = "Baru"
	}

	var t models.Tugas
	err := r.db.QueryRow(ctx, query,
		req.ProyekID,
		req.NamaTugas,
		req.Deskripsi,
		prioritas,
		status,
		tanggalMulai,
		tanggalDeadline,
	).Scan(
		&t.TugasID,
		&t.ProyekID,
		&t.NamaTugas,
		&t.Deskripsi,
		&t.Prioritas,
		&t.Status,
		&t.TanggalMulai,
		&t.TanggalDeadline,
		&t.DibuatPada,
		&t.DiperbaruiPada,
	)

	if err != nil {
		return nil, fmt.Errorf("gagal create tugas: %w", err)
	}

	return &t, nil
}

// Update mengupdate tugas
func (r *TugasRepository) Update(ctx context.Context, id int, req models.TugasUpdateRequest) (*models.Tugas, error) {
	query := `UPDATE tugas SET `
	params := []interface{}{}
	paramCount := 1

	if req.NamaTugas != nil {
		query += fmt.Sprintf("nama_tugas = $%d, ", paramCount)
		params = append(params, *req.NamaTugas)
		paramCount++
	}
	if req.Deskripsi != nil {
		query += fmt.Sprintf("deskripsi = $%d, ", paramCount)
		params = append(params, *req.Deskripsi)
		paramCount++
	}
	if req.TanggalMulai != nil {
		t, err := time.Parse("2006-01-02", *req.TanggalMulai)
		if err != nil {
			return nil, fmt.Errorf("format tanggal_mulai tidak valid: %w", err)
		}
		query += fmt.Sprintf("tanggal_mulai = $%d, ", paramCount)
		params = append(params, t)
		paramCount++
	}
	if req.TanggalDeadline != nil {
		t, err := time.Parse("2006-01-02", *req.TanggalDeadline)
		if err != nil {
			return nil, fmt.Errorf("format tanggal_deadline tidak valid: %w", err)
		}
		query += fmt.Sprintf("tanggal_deadline = $%d, ", paramCount)
		params = append(params, t)
		paramCount++
	}
	if req.Prioritas != nil {
		query += fmt.Sprintf("prioritas = $%d, ", paramCount)
		params = append(params, *req.Prioritas)
		paramCount++
	}
	if req.Status != nil {
		query += fmt.Sprintf("status = $%d, ", paramCount)
		params = append(params, *req.Status)
		paramCount++
	}

	query = query[:len(query)-2]
	query += fmt.Sprintf(` WHERE tugas_id = $%d
		RETURNING tugas_id, proyek_id, nama_tugas, deskripsi, prioritas, status,
		          tanggal_mulai, tanggal_deadline, dibuat_pada, diperbarui_pada`, paramCount)
	params = append(params, id)

	var t models.Tugas
	err := r.db.QueryRow(ctx, query, params...).Scan(
		&t.TugasID,
		&t.ProyekID,
		&t.NamaTugas,
		&t.Deskripsi,
		&t.Prioritas,
		&t.Status,
		&t.TanggalMulai,
		&t.TanggalDeadline,
		&t.DibuatPada,
		&t.DiperbaruiPada,
	)

	if err != nil {
		return nil, fmt.Errorf("gagal update tugas: %w", err)
	}

	return &t, nil
}

// Delete menghapus tugas
func (r *TugasRepository) Delete(ctx context.Context, id int) error {
	query := `DELETE FROM tugas WHERE tugas_id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("gagal delete tugas: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("tugas dengan ID %d tidak ditemukan", id)
	}

	return nil
}

// GetAssignedUsers mengambil daftar user yang di-assign ke tugas tertentu
func (r *TugasRepository) GetAssignedUsers(ctx context.Context, tugasID int) ([]models.Pengguna, error) {
	query := `
		SELECT p.pengguna_id, p.nama_depan, p.nama_belakang, p.email, p.peran, 
		       p.is_aktif, p.dibuat_pada, p.terakhir_login, p.oauth_provider, 
		       p.oauth_uid, p.url_foto_profil
		FROM pengguna p
		INNER JOIN penugasan_tugas pt ON p.pengguna_id = pt.pengguna_id
		WHERE pt.tugas_id = $1
		ORDER BY pt.ditugaskan_pada DESC
	`

	rows, err := r.db.Query(ctx, query, tugasID)
	if err != nil {
		return nil, fmt.Errorf("gagal query assigned users: %w", err)
	}
	defer rows.Close()

	var users []models.Pengguna
	for rows.Next() {
		var u models.Pengguna
		err := rows.Scan(
			&u.PenggunaID,
			&u.NamaDepan,
			&u.NamaBelakang,
			&u.Email,
			&u.Peran,
			&u.IsAktif,
			&u.DibuatPada,
			&u.TerakhirLogin,
			&u.OAuthProvider,
			&u.OAuthUID,
			&u.URLFotoProfil,
		)
		if err != nil {
			return nil, fmt.Errorf("gagal scan assigned user: %w", err)
		}
		users = append(users, u)
	}

	return users, nil
}

// AssignUser assign user ke tugas
func (r *TugasRepository) AssignUser(ctx context.Context, tugasID, penggunaID int) error {
	query := `
		INSERT INTO penugasan_tugas (tugas_id, pengguna_id)
		VALUES ($1, $2)
		ON CONFLICT (tugas_id, pengguna_id) DO NOTHING
	`

	_, err := r.db.Exec(ctx, query, tugasID, penggunaID)
	if err != nil {
		return fmt.Errorf("gagal assign user ke tugas: %w", err)
	}

	return nil
}

// UnassignUser unassign user dari tugas
func (r *TugasRepository) UnassignUser(ctx context.Context, tugasID, penggunaID int) error {
	query := `DELETE FROM penugasan_tugas WHERE tugas_id = $1 AND pengguna_id = $2`

	result, err := r.db.Exec(ctx, query, tugasID, penggunaID)
	if err != nil {
		return fmt.Errorf("gagal unassign user: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("penugasan tidak ditemukan")
	}

	return nil
}
