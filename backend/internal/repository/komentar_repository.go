package repository

import (
	"context"
	"fmt"

	"github.com/A-Pujo/pj-task-manager/backend/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

// KomentarRepository handle database operations untuk Komentar
type KomentarRepository struct {
	db *pgxpool.Pool
}

// NewKomentarRepository membuat instance baru
func NewKomentarRepository(db *pgxpool.Pool) *KomentarRepository {
	return &KomentarRepository{db: db}
}

// GetAll mengambil semua komentar
func (r *KomentarRepository) GetAll(ctx context.Context) ([]models.KomentarAktivitas, error) {
	query := `
		SELECT komentar_id, pengguna_id, isi_komentar, waktu_dibuat, tugas_id, proyek_id
		FROM komentar_aktivitas
		ORDER BY waktu_dibuat DESC
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("gagal query komentar: %w", err)
	}
	defer rows.Close()

	var komentars []models.KomentarAktivitas
	for rows.Next() {
		var k models.KomentarAktivitas
		err := rows.Scan(
			&k.KomentarID,
			&k.PenggunaID,
			&k.IsiKomentar,
			&k.WaktuDibuat,
			&k.TugasID,
			&k.ProyekID,
		)
		if err != nil {
			return nil, fmt.Errorf("gagal scan row komentar: %w", err)
		}
		komentars = append(komentars, k)
	}

	return komentars, nil
}

// GetByTugasID mengambil komentar by tugas
func (r *KomentarRepository) GetByTugasID(ctx context.Context, tugasID int) ([]models.KomentarAktivitas, error) {
	query := `
		SELECT komentar_id, pengguna_id, isi_komentar, waktu_dibuat, tugas_id, proyek_id
		FROM komentar_aktivitas
		WHERE tugas_id = $1
		ORDER BY waktu_dibuat DESC
	`

	rows, err := r.db.Query(ctx, query, tugasID)
	if err != nil {
		return nil, fmt.Errorf("gagal query komentar by tugas: %w", err)
	}
	defer rows.Close()

	var komentars []models.KomentarAktivitas
	for rows.Next() {
		var k models.KomentarAktivitas
		err := rows.Scan(
			&k.KomentarID,
			&k.PenggunaID,
			&k.IsiKomentar,
			&k.WaktuDibuat,
			&k.TugasID,
			&k.ProyekID,
		)
		if err != nil {
			return nil, fmt.Errorf("gagal scan row komentar: %w", err)
		}
		komentars = append(komentars, k)
	}

	return komentars, nil
}

// GetByProyekID mengambil komentar by proyek
func (r *KomentarRepository) GetByProyekID(ctx context.Context, proyekID int) ([]models.KomentarAktivitas, error) {
	query := `
		SELECT komentar_id, pengguna_id, isi_komentar, waktu_dibuat, tugas_id, proyek_id
		FROM komentar_aktivitas
		WHERE proyek_id = $1
		ORDER BY waktu_dibuat DESC
	`

	rows, err := r.db.Query(ctx, query, proyekID)
	if err != nil {
		return nil, fmt.Errorf("gagal query komentar by proyek: %w", err)
	}
	defer rows.Close()

	var komentars []models.KomentarAktivitas
	for rows.Next() {
		var k models.KomentarAktivitas
		err := rows.Scan(
			&k.KomentarID,
			&k.PenggunaID,
			&k.IsiKomentar,
			&k.WaktuDibuat,
			&k.TugasID,
			&k.ProyekID,
		)
		if err != nil {
			return nil, fmt.Errorf("gagal scan row komentar: %w", err)
		}
		komentars = append(komentars, k)
	}

	return komentars, nil
}

// Create membuat komentar baru
func (r *KomentarRepository) Create(ctx context.Context, req models.KomentarCreateRequest) (*models.KomentarAktivitas, error) {
	// Validasi: harus ada TugasID atau ProyekID
	if req.TugasID == nil && req.ProyekID == nil {
		return nil, fmt.Errorf("komentar harus terkait dengan tugas atau proyek")
	}

	if req.TugasID != nil && req.ProyekID != nil {
		return nil, fmt.Errorf("komentar tidak bisa terkait dengan tugas dan proyek sekaligus")
	}

	query := `
		INSERT INTO komentar_aktivitas (pengguna_id, isi_komentar, tugas_id, proyek_id)
		VALUES ($1, $2, $3, $4)
		RETURNING komentar_id, pengguna_id, isi_komentar, waktu_dibuat, tugas_id, proyek_id
	`

	var k models.KomentarAktivitas
	err := r.db.QueryRow(ctx, query,
		req.PenggunaID,
		req.IsiKomentar,
		req.TugasID,
		req.ProyekID,
	).Scan(
		&k.KomentarID,
		&k.PenggunaID,
		&k.IsiKomentar,
		&k.WaktuDibuat,
		&k.TugasID,
		&k.ProyekID,
	)

	if err != nil {
		return nil, fmt.Errorf("gagal create komentar: %w", err)
	}

	return &k, nil
}

// Delete menghapus komentar
func (r *KomentarRepository) Delete(ctx context.Context, id int) error {
	query := `DELETE FROM komentar_aktivitas WHERE komentar_id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("gagal delete komentar: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("komentar dengan ID %d tidak ditemukan", id)
	}

	return nil
}

// GetWithUser mengambil komentar dengan detail pengguna (JOIN)
func (r *KomentarRepository) GetWithUser(ctx context.Context, komentarID int) (*models.KomentarWithUser, error) {
	query := `
		SELECT 
			k.komentar_id, k.pengguna_id, k.isi_komentar, k.waktu_dibuat, k.tugas_id, k.proyek_id,
			p.pengguna_id, p.nama_depan, p.nama_belakang, p.email, p.peran, 
			p.is_aktif, p.dibuat_pada, p.terakhir_login, p.oauth_provider, 
			p.oauth_uid, p.url_foto_profil
		FROM komentar_aktivitas k
		INNER JOIN pengguna p ON k.pengguna_id = p.pengguna_id
		WHERE k.komentar_id = $1
	`

	var komentar models.KomentarWithUser
	err := r.db.QueryRow(ctx, query, komentarID).Scan(
		&komentar.KomentarID,
		&komentar.PenggunaID,
		&komentar.IsiKomentar,
		&komentar.WaktuDibuat,
		&komentar.TugasID,
		&komentar.ProyekID,
		&komentar.Pengguna.PenggunaID,
		&komentar.Pengguna.NamaDepan,
		&komentar.Pengguna.NamaBelakang,
		&komentar.Pengguna.Email,
		&komentar.Pengguna.Peran,
		&komentar.Pengguna.IsAktif,
		&komentar.Pengguna.DibuatPada,
		&komentar.Pengguna.TerakhirLogin,
		&komentar.Pengguna.OAuthProvider,
		&komentar.Pengguna.OAuthUID,
		&komentar.Pengguna.URLFotoProfil,
	)

	if err != nil {
		return nil, fmt.Errorf("komentar tidak ditemukan: %w", err)
	}

	return &komentar, nil
}
