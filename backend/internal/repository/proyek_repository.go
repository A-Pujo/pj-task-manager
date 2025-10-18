package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/A-Pujo/pj-task-manager/backend/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ProyekRepository handle database operations untuk Proyek
type ProyekRepository struct {
	db *pgxpool.Pool
}

// NewProyekRepository membuat instance baru
func NewProyekRepository(db *pgxpool.Pool) *ProyekRepository {
	return &ProyekRepository{db: db}
}

// GetAll mengambil semua proyek
func (r *ProyekRepository) GetAll(ctx context.Context) ([]models.Proyek, error) {
	query := `
		SELECT proyek_id, nama_proyek, deskripsi, tanggal_mulai, 
		       tanggal_selesai, status, pengguna_id, dibuat_pada, diperbarui_pada
		FROM proyek
		ORDER BY dibuat_pada DESC
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query proyek: %w", err)
	}
	defer rows.Close()

	var proyeks []models.Proyek
	for rows.Next() {
		var p models.Proyek
		err := rows.Scan(
			&p.ProyekID,
			&p.NamaProyek,
			&p.Deskripsi,
			&p.TanggalMulai,
			&p.TanggalSelesai,
			&p.Status,
			&p.PenggunaID,
			&p.DibuatPada,
			&p.DiperbaruiPada,
		)
		if err != nil {
			return nil, fmt.Errorf("gagal scan row proyek: %w", err)
		}
		proyeks = append(proyeks, p)
	}

	return proyeks, nil
}

// GetByID mengambil proyek by ID
func (r *ProyekRepository) GetByID(ctx context.Context, id int) (*models.Proyek, error) {
	query := `
		SELECT proyek_id, nama_proyek, deskripsi, tanggal_mulai, 
		       tanggal_selesai, status, pengguna_id, dibuat_pada, diperbarui_pada
		FROM proyek
		WHERE proyek_id = $1
	`

	var p models.Proyek
	err := r.db.QueryRow(ctx, query, id).Scan(
		&p.ProyekID,
		&p.NamaProyek,
		&p.Deskripsi,
		&p.TanggalMulai,
		&p.TanggalSelesai,
		&p.Status,
		&p.PenggunaID,
		&p.DibuatPada,
		&p.DiperbaruiPada,
	)

	if err != nil {
		return nil, fmt.Errorf("proyek tidak ditemukan: %w", err)
	}

	return &p, nil
}

// Create membuat proyek baru
func (r *ProyekRepository) Create(ctx context.Context, req models.ProyekCreateRequest) (*models.Proyek, error) {
	query := `
		INSERT INTO proyek (nama_proyek, deskripsi, tanggal_mulai, tanggal_selesai, status, pengguna_id)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING proyek_id, nama_proyek, deskripsi, tanggal_mulai, tanggal_selesai, 
		          status, pengguna_id, dibuat_pada, diperbarui_pada
	`

	// Parse tanggal
	tanggalMulai, err := time.Parse("2006-01-02", req.TanggalMulai)
	if err != nil {
		return nil, fmt.Errorf("format tanggal_mulai tidak valid: %w", err)
	}

	var tanggalSelesai *time.Time
	if req.TanggalSelesai != nil {
		t, err := time.Parse("2006-01-02", *req.TanggalSelesai)
		if err != nil {
			return nil, fmt.Errorf("format tanggal_selesai tidak valid: %w", err)
		}
		tanggalSelesai = &t
	}

	status := req.Status
	if status == "" {
		status = "Dalam Proses"
	}

	var p models.Proyek
	err = r.db.QueryRow(ctx, query,
		req.NamaProyek,
		req.Deskripsi,
		tanggalMulai,
		tanggalSelesai,
		status,
		req.PenggunaID,
	).Scan(
		&p.ProyekID,
		&p.NamaProyek,
		&p.Deskripsi,
		&p.TanggalMulai,
		&p.TanggalSelesai,
		&p.Status,
		&p.PenggunaID,
		&p.DibuatPada,
		&p.DiperbaruiPada,
	)

	if err != nil {
		return nil, fmt.Errorf("gagal create proyek: %w", err)
	}

	return &p, nil
}

// Update mengupdate proyek
func (r *ProyekRepository) Update(ctx context.Context, id int, req models.ProyekUpdateRequest) (*models.Proyek, error) {
	query := `UPDATE proyek SET `
	params := []interface{}{}
	paramCount := 1

	if req.NamaProyek != nil {
		query += fmt.Sprintf("nama_proyek = $%d, ", paramCount)
		params = append(params, *req.NamaProyek)
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
	if req.TanggalSelesai != nil {
		t, err := time.Parse("2006-01-02", *req.TanggalSelesai)
		if err != nil {
			return nil, fmt.Errorf("format tanggal_selesai tidak valid: %w", err)
		}
		query += fmt.Sprintf("tanggal_selesai = $%d, ", paramCount)
		params = append(params, t)
		paramCount++
	}
	if req.Status != nil {
		query += fmt.Sprintf("status = $%d, ", paramCount)
		params = append(params, *req.Status)
		paramCount++
	}
	if req.PenggunaID != nil {
		query += fmt.Sprintf("pengguna_id = $%d, ", paramCount)
		params = append(params, *req.PenggunaID)
		paramCount++
	}

	query = query[:len(query)-2]
	query += fmt.Sprintf(` WHERE proyek_id = $%d
		RETURNING proyek_id, nama_proyek, deskripsi, tanggal_mulai, tanggal_selesai, 
		          status, pengguna_id, dibuat_pada, diperbarui_pada`, paramCount)
	params = append(params, id)

	var p models.Proyek
	err := r.db.QueryRow(ctx, query, params...).Scan(
		&p.ProyekID,
		&p.NamaProyek,
		&p.Deskripsi,
		&p.TanggalMulai,
		&p.TanggalSelesai,
		&p.Status,
		&p.PenggunaID,
		&p.DibuatPada,
		&p.DiperbaruiPada,
	)

	if err != nil {
		return nil, fmt.Errorf("gagal update proyek: %w", err)
	}

	return &p, nil
}

// Delete menghapus proyek
func (r *ProyekRepository) Delete(ctx context.Context, id int) error {
	query := `DELETE FROM proyek WHERE proyek_id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("gagal delete proyek: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("proyek dengan ID %d tidak ditemukan", id)
	}

	return nil
}
