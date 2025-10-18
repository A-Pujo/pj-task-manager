package models

import "time"

// PenugasanTugas merepresentasikan tabel 'penugasan_tugas' (many-to-many)
type PenugasanTugas struct {
	TugasID       int       `json:"tugas_id" db:"tugas_id"`
	PenggunaID    int       `json:"pengguna_id" db:"pengguna_id"`
	DitugaskanPada time.Time `json:"ditugaskan_pada" db:"ditugaskan_pada"`
}

// PenugasanTugasRequest untuk assign user ke tugas
type PenugasanTugasRequest struct {
	TugasID    int `json:"tugas_id" binding:"required"`
	PenggunaID int `json:"pengguna_id" binding:"required"`
}
