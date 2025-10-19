package repository

import (
	"context"
	"fmt"

	"github.com/A-Pujo/pj-task-manager/backend/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

// PenugasanTugasRepository handle database operations untuk PenugasanTugas
type PenugasanTugasRepository struct {
	db *pgxpool.Pool
}

// NewPenugasanTugasRepository membuat instance baru
func NewPenugasanTugasRepository(db *pgxpool.Pool) *PenugasanTugasRepository {
	return &PenugasanTugasRepository{db: db}
}

// AssignUser assign user ke tugas
func (r *PenugasanTugasRepository) AssignUser(ctx context.Context, tugasID, penggunaID int) error {
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

// UnassignUser remove user dari tugas
func (r *PenugasanTugasRepository) UnassignUser(ctx context.Context, tugasID, penggunaID int) error {
	query := `DELETE FROM penugasan_tugas WHERE tugas_id = $1 AND pengguna_id = $2`

	_, err := r.db.Exec(ctx, query, tugasID, penggunaID)
	if err != nil {
		return fmt.Errorf("gagal unassign user dari tugas: %w", err)
	}

	return nil
}

// GetAssignedUsers mendapatkan semua user yang di-assign ke tugas
func (r *PenugasanTugasRepository) GetAssignedUsers(ctx context.Context, tugasID int) ([]models.Pengguna, error) {
	query := `
		SELECT p.pengguna_id, p.nama_depan, p.nama_belakang, p.email, 
		       p.peran, p.is_aktif, p.terakhir_login, p.dibuat_pada
		FROM pengguna p
		INNER JOIN penugasan_tugas pt ON p.pengguna_id = pt.pengguna_id
		WHERE pt.tugas_id = $1
		ORDER BY p.nama_depan, p.nama_belakang
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
			&u.TerakhirLogin,
			&u.DibuatPada,
		)
		if err != nil {
			return nil, fmt.Errorf("gagal scan row assigned user: %w", err)
		}
		users = append(users, u)
	}

	return users, nil
}

// GetUserTasks mendapatkan semua tugas yang di-assign ke user
func (r *PenugasanTugasRepository) GetUserTasks(ctx context.Context, penggunaID int) ([]models.Tugas, error) {
	query := `
		SELECT t.tugas_id, t.proyek_id, t.nama_tugas, t.deskripsi, t.prioritas, 
		       t.status, t.tanggal_mulai, t.tanggal_deadline, t.dibuat_pada, t.diperbarui_pada
		FROM tugas t
		INNER JOIN penugasan_tugas pt ON t.tugas_id = pt.tugas_id
		WHERE pt.pengguna_id = $1
		ORDER BY t.tanggal_deadline ASC NULLS LAST, t.prioritas DESC
	`

	rows, err := r.db.Query(ctx, query, penggunaID)
	if err != nil {
		return nil, fmt.Errorf("gagal query user tasks: %w", err)
	}
	defer rows.Close()

	var tasks []models.Tugas
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
			return nil, fmt.Errorf("gagal scan row user task: %w", err)
		}
		tasks = append(tasks, t)
	}

	return tasks, nil
}

// AssignMultipleUsers assign multiple users ke tugas sekaligus
func (r *PenugasanTugasRepository) AssignMultipleUsers(ctx context.Context, tugasID int, penggunaIDs []int) error {
	// Clear existing assignments
	_, err := r.db.Exec(ctx, "DELETE FROM penugasan_tugas WHERE tugas_id = $1", tugasID)
	if err != nil {
		return fmt.Errorf("gagal clear existing assignments: %w", err)
	}

	// Insert new assignments
	if len(penggunaIDs) > 0 {
		query := `INSERT INTO penugasan_tugas (tugas_id, pengguna_id) VALUES ($1, $2)`
		for _, penggunaID := range penggunaIDs {
			_, err := r.db.Exec(ctx, query, tugasID, penggunaID)
			if err != nil {
				return fmt.Errorf("gagal assign user %d: %w", penggunaID, err)
			}
		}
	}

	return nil
}
