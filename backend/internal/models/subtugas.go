package models

import "time"

// Subtugas merepresentasikan tabel 'subtugas' di database
type Subtugas struct {
	SubtugasID        int        `json:"subtugas_id" db:"subtugas_id"`
	TugasID           int        `json:"tugas_id" db:"tugas_id"`
	NamaSubtugas      string     `json:"nama_subtugas" db:"nama_subtugas"`
	Deskripsi         *string    `json:"deskripsi,omitempty" db:"deskripsi"`
	Prioritas         string     `json:"prioritas" db:"prioritas"` // Tinggi, Sedang, Rendah
	Status            string     `json:"status" db:"status"`       // Baru, Sedang Dikerjakan, Selesai
	PersentaseSelesai int        `json:"persentase_selesai" db:"persentase_selesai"`
	PenggunaID        *int       `json:"pengguna_id,omitempty" db:"pengguna_id"`
	TanggalMulai      *time.Time `json:"tanggal_mulai,omitempty" db:"tanggal_mulai"`
	TanggalDeadline   *time.Time `json:"tanggal_deadline,omitempty" db:"tanggal_deadline"`
	DibuatPada      time.Time  `json:"dibuat_pada" db:"dibuat_pada"`
	DiperbaruiPada  *time.Time `json:"diperbarui_pada,omitempty" db:"diperbarui_pada"`
}

// SubtugasCreateRequest untuk create subtugas baru
type SubtugasCreateRequest struct {
	TugasID       int     `json:"tugas_id" binding:"required"`
	NamaSubtugas  string  `json:"nama_subtugas" binding:"required"`
	Deskripsi     *string `json:"deskripsi"`
	Prioritas     string  `json:"prioritas"`
	Status        string  `json:"status"`
	TanggalMulai  *string `json:"tanggal_mulai"`  // Format: YYYY-MM-DD
	TanggalDeadline *string `json:"tanggal_deadline"` // Format: YYYY-MM-DD
}

// SubtugasUpdateRequest untuk update subtugas
type SubtugasUpdateRequest struct {
	NamaSubtugas      *string `json:"nama_subtugas"`
	Deskripsi         *string `json:"deskripsi"`
	Prioritas         *string `json:"prioritas"`
	Status            *string `json:"status"`
	PersentaseSelesai *int    `json:"persentase_selesai"`
	TanggalMulai      *string `json:"tanggal_mulai"`
	TanggalDeadline   *string `json:"tanggal_deadline"`
	PenggunaID        *int    `json:"pengguna_id"`
}