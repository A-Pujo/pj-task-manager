package models

import "time"

// Tugas merepresentasikan tabel 'tugas' di database
type Tugas struct {
	TugasID         int        `json:"tugas_id" db:"tugas_id"`
	ProyekID        int        `json:"proyek_id" db:"proyek_id"`
	NamaTugas       string     `json:"nama_tugas" db:"nama_tugas"`
	Deskripsi       *string    `json:"deskripsi,omitempty" db:"deskripsi"`
	Prioritas       string     `json:"prioritas" db:"prioritas"` // Tinggi, Sedang, Rendah
	Status          string     `json:"status" db:"status"`       // Baru, Sedang Dikerjakan, Selesai
	TanggalMulai    *time.Time `json:"tanggal_mulai,omitempty" db:"tanggal_mulai"`
	TanggalDeadline *time.Time `json:"tanggal_deadline,omitempty" db:"tanggal_deadline"`
	DibuatPada      time.Time  `json:"dibuat_pada" db:"dibuat_pada"`
	DiperbaruiPada  *time.Time `json:"diperbarui_pada,omitempty" db:"diperbarui_pada"`
}

// TugasCreateRequest untuk create tugas baru
type TugasCreateRequest struct {
	ProyekID        int     `json:"proyek_id" binding:"required"`
	NamaTugas       string  `json:"nama_tugas" binding:"required"`
	Deskripsi       *string `json:"deskripsi"`
	Prioritas       string  `json:"prioritas"`
	Status          string  `json:"status"`
	TanggalMulai    *string `json:"tanggal_mulai"`    // Format: YYYY-MM-DD
	TanggalDeadline *string `json:"tanggal_deadline"` // Format: YYYY-MM-DD
}

// TugasUpdateRequest untuk update tugas
type TugasUpdateRequest struct {
	NamaTugas       *string `json:"nama_tugas"`
	Deskripsi       *string `json:"deskripsi"`
	Prioritas       *string `json:"prioritas"`
	Status          *string `json:"status"`
	TanggalMulai    *string `json:"tanggal_mulai"`
	TanggalDeadline *string `json:"tanggal_deadline"`
}

// TugasWithAssignees adalah struct untuk response yang include assigned users
type TugasWithAssignees struct {
	Tugas
	AssignedUsers []Pengguna `json:"assigned_users"`
}
