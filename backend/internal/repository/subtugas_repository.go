package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/A-Pujo/pj-task-manager/backend/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

// SubtugasRepository handle database operations untuk Subtugas
type SubtugasRepository struct {
	db *pgxpool.Pool
}

// NewSubtugasRepository membuat instance baru
func NewSubtugasRepository(db *pgxpool.Pool) *SubtugasRepository {
	return &SubtugasRepository{db: db}
}

// GetAll mengambil semua tugas
func (r *SubtugasRepository) GetAll(ctx context.Context) ([]models.Subtugas, error) {
	query := `
		SELECT subtugas_id, tugas_id, nama_subtugas, deskripsi, prioritas, status, persentase_selesai,
		       pengguna_id, tanggal_mulai, tanggal_deadline, dibuat_pada, diperbarui_pada
		FROM subtugas
		ORDER BY subtugas_id DESC
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query tugas: %w", err)
	}
	defer rows.Close()
	
	var subtugass []models.Subtugas
	for rows.Next() {
		var st models.Subtugas
		err := rows.Scan(
			&st.SubtugasID,
			&st.TugasID,
			&st.NamaSubtugas,
			&st.Deskripsi,
			&st.Prioritas,
			&st.Status,
			&st.PersentaseSelesai,
			&st.PenggunaID,
			&st.TanggalMulai,
			&st.TanggalDeadline,
			&st.DibuatPada,
			&st.DiperbaruiPada,
		)
		if err != nil {
			return nil, fmt.Errorf("gagal scan row tugas: %w", err)
		}
		subtugass = append(subtugass, st)
	}

	return subtugass, nil
}

// GetByID mengambil tugas by ID
func (r *SubtugasRepository) GetByID(ctx context.Context, id int) (*models.Subtugas, error) {
	query := `
		SELECT subtugas_id, tugas_id, nama_subtugas, deskripsi, prioritas, status, persentase_selesai,
		       pengguna_id, tanggal_mulai, tanggal_deadline, dibuat_pada, diperbarui_pada
		FROM subtugas
		WHERE subtugas_id = $1
	`

	var st models.Subtugas
	err := r.db.QueryRow(ctx, query, id).Scan(
		&st.SubtugasID,
		&st.TugasID,
		&st.NamaSubtugas,
		&st.Deskripsi,
		&st.Prioritas,
		&st.Status,
		&st.PersentaseSelesai,
		&st.PenggunaID,
		&st.TanggalMulai,
		&st.TanggalDeadline,
		&st.DibuatPada,
		&st.DiperbaruiPada,
	)

	if err != nil {
		return nil, fmt.Errorf("gagal ambil subtugas: %w", err)
	}

	return &st, nil
}

// GetByTugasID mengambil semua subtugas berdasarkan tugas ID
func (r *SubtugasRepository) GetByTugasID(ctx context.Context, tugasID int) ([]models.Subtugas, error) {
	query := `
		SELECT subtugas_id, tugas_id, nama_subtugas, deskripsi, prioritas, status,
		       persentase_selesai, pengguna_id, tanggal_mulai, tanggal_deadline, dibuat_pada, diperbarui_pada
		FROM subtugas
		WHERE tugas_id = $1
		ORDER BY subtugas_id DESC
	`

	rows, err := r.db.Query(ctx, query, tugasID)
	if err != nil {
		return nil, fmt.Errorf("gagal query subtugas by tugas ID: %w", err)
	}
	defer rows.Close()

	var subtugass []models.Subtugas
	for rows.Next() {
		var st models.Subtugas
		err := rows.Scan(
			&st.SubtugasID,
			&st.TugasID,
			&st.NamaSubtugas,
			&st.Deskripsi,
			&st.Prioritas,
			&st.Status,
			&st.PersentaseSelesai,
			&st.PenggunaID,
			&st.TanggalMulai,
			&st.TanggalDeadline,
			&st.DibuatPada,
			&st.DiperbaruiPada,
		)
		if err != nil {
			return nil, fmt.Errorf("gagal scan row subtugas: %w", err)
		}
		subtugass = append(subtugass, st)
	}

	return subtugass, nil
}

// Create membuat subtugas baru
func (r *SubtugasRepository) Create(ctx context.Context, req models.SubtugasCreateRequest) (*models.Subtugas, error) {
	query := `
		INSERT INTO subtugas (tugas_id, nama_subtugas, deskripsi, prioritas, status, tanggal_mulai, tanggal_deadline)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING subtugas_id, tugas_id, nama_subtugas, deskripsi, prioritas, status, persentase_selesai,
		          pengguna_id, tanggal_mulai, tanggal_deadline, dibuat_pada, diperbarui_pada
	`

	var tanggalMulai, tanggalDeadline *time.Time

	if req.TanggalMulai != nil {
		t, err := time.Parse("2006-01-02", *req.TanggalMulai)
		if err != nil {
			return nil, fmt.Errorf("format tanggal_mulai tidak valid: %w", err)
		}
		tanggalMulai = &t
	}

	if req.TanggalDeadline != nil {
		t, err := time.Parse("2006-01-02", *req.TanggalDeadline)
		if err != nil {
			return nil, fmt.Errorf("format tanggal_deadline tidak valid: %w", err)
		}
		tanggalDeadline = &t
	}

	var st models.Subtugas
	err := r.db.QueryRow(ctx, query,
		req.TugasID,
		req.NamaSubtugas,
		req.Deskripsi,
		req.Prioritas,
		req.Status,
		tanggalMulai,
		tanggalDeadline,
	).Scan(
		&st.SubtugasID,
		&st.TugasID,
		&st.NamaSubtugas,
		&st.Deskripsi,
		&st.Prioritas,
		&st.Status,
		&st.PersentaseSelesai,
		&st.PenggunaID,
		&st.TanggalMulai,
		&st.TanggalDeadline,
		&st.DibuatPada,
		&st.DiperbaruiPada,
	)

	if err != nil {
		return nil, fmt.Errorf("gagal buat subtugas: %w", err)
	}

	return &st, nil
}

// Update mengupdate subtugas
func (r *SubtugasRepository) Update(ctx context.Context, id int, req models.SubtugasUpdateRequest) (*models.Subtugas, error) {
	query := `UPDATE subtugas SET `
	params := []interface{}{}
	paramCount := 1

	if req.NamaSubtugas != nil {
		query += fmt.Sprintf("nama_subtugas = $%d, ", paramCount)
		params = append(params, *req.NamaSubtugas)
		paramCount++
	}
	if req.Deskripsi != nil {
		query += fmt.Sprintf("deskripsi = $%d, ", paramCount)
		params = append(params, *req.Deskripsi)
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
	if req.PersentaseSelesai != nil {
		query += fmt.Sprintf("persentase_selesai = $%d, ", paramCount)
		params = append(params, *req.PersentaseSelesai)
		paramCount++
	}
	if req.PenggunaID != nil {
		query += fmt.Sprintf("pengguna_id = $%d, ", paramCount)
		params = append(params, *req.PenggunaID)
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

	// Always set diperbarui_pada to current timestamp
	query += "diperbarui_pada = NOW()"

	// Add WHERE clause
	query += fmt.Sprintf(` WHERE subtugas_id = $%d
		RETURNING subtugas_id, tugas_id, nama_subtugas, deskripsi, prioritas, status, persentase_selesai,
		          pengguna_id, tanggal_mulai, tanggal_deadline, dibuat_pada, diperbarui_pada`, paramCount)
	params = append(params, id)

	var st models.Subtugas
	err := r.db.QueryRow(ctx, query, params...).Scan(
		&st.SubtugasID,
		&st.TugasID,
		&st.NamaSubtugas,
		&st.Deskripsi,
		&st.Prioritas,
		&st.Status,
		&st.PersentaseSelesai,
		&st.PenggunaID,
		&st.TanggalMulai,
		&st.TanggalDeadline,
		&st.DibuatPada,
		&st.DiperbaruiPada,
	)

	if err != nil {
		return nil, fmt.Errorf("gagal update tugas: %w", err)
	}

	return &st, nil
}

// Delete menghapus tugas
func (r *SubtugasRepository) Delete(ctx context.Context, id int) error {
	query := `DELETE FROM subtugas WHERE subtugas_id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("gagal delete subtugas: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("subtugas dengan ID %d tidak ditemukan", id)
	}

	return nil
}