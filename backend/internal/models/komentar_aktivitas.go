package models

import "time"

// KomentarAktivitas merepresentasikan tabel 'komentar_aktivitas'
type KomentarAktivitas struct {
	KomentarID   int        `json:"komentar_id" db:"komentar_id"`
	PenggunaID   int        `json:"pengguna_id" db:"pengguna_id"`
	IsiKomentar  string     `json:"isi_komentar" db:"isi_komentar"`
	WaktuDibuat  time.Time  `json:"waktu_dibuat" db:"waktu_dibuat"`
	TugasID      *int       `json:"tugas_id,omitempty" db:"tugas_id"`
	ProyekID     *int       `json:"proyek_id,omitempty" db:"proyek_id"`
}

// KomentarCreateRequest untuk create komentar baru
type KomentarCreateRequest struct {
	PenggunaID  int     `json:"pengguna_id" binding:"required"`
	IsiKomentar string  `json:"isi_komentar" binding:"required"`
	TugasID     *int    `json:"tugas_id"`   // Salah satu dari TugasID atau ProyekID harus ada
	ProyekID    *int    `json:"proyek_id"`  // Salah satu dari TugasID atau ProyekID harus ada
}

// KomentarWithUser adalah struct response yang include data pengguna
type KomentarWithUser struct {
	KomentarAktivitas
	Pengguna Pengguna `json:"pengguna"`
}
