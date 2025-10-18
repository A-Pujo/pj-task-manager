package models

import "time"

// Proyek merepresentasikan tabel 'proyek' di database
type Proyek struct {
	ProyekID       int        `json:"proyek_id" db:"proyek_id"`
	NamaProyek     string     `json:"nama_proyek" db:"nama_proyek"`
	Deskripsi      *string    `json:"deskripsi,omitempty" db:"deskripsi"`
	TanggalMulai   time.Time  `json:"tanggal_mulai" db:"tanggal_mulai"`
	TanggalSelesai *time.Time `json:"tanggal_selesai,omitempty" db:"tanggal_selesai"`
	Status         string     `json:"status" db:"status"` // Dalam Proses, Selesai, Tertunda
	PenggunaID     *int       `json:"pengguna_id,omitempty" db:"pengguna_id"`
	DibuatPada     time.Time  `json:"dibuat_pada" db:"dibuat_pada"`
	DiperbaruiPada *time.Time `json:"diperbarui_pada,omitempty" db:"diperbarui_pada"`
}

// ProyekCreateRequest untuk create proyek baru
type ProyekCreateRequest struct {
	NamaProyek     string  `json:"nama_proyek" binding:"required"`
	Deskripsi      *string `json:"deskripsi"`
	TanggalMulai   string  `json:"tanggal_mulai" binding:"required"` // Format: YYYY-MM-DD
	TanggalSelesai *string `json:"tanggal_selesai"`
	Status         string  `json:"status"`
	PenggunaID     *int    `json:"pengguna_id"`
}

// ProyekUpdateRequest untuk update proyek
type ProyekUpdateRequest struct {
	NamaProyek     *string `json:"nama_proyek"`
	Deskripsi      *string `json:"deskripsi"`
	TanggalMulai   *string `json:"tanggal_mulai"`
	TanggalSelesai *string `json:"tanggal_selesai"`
	Status         *string `json:"status"`
	PenggunaID     *int    `json:"pengguna_id"`
}
