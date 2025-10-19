package models

import "time"

// Pengguna merepresentasikan tabel 'pengguna' di database
// Struct ini digunakan untuk mapping data dari/ke database
type Pengguna struct {
	// Primary Key
	PenggunaID int `json:"pengguna_id" db:"pengguna_id"`

	// Data Pribadi
	NamaDepan     string `json:"nama_depan" db:"nama_depan"`
	NamaBelakang  string `json:"nama_belakang" db:"nama_belakang"`
	Email         string `json:"email" db:"email"`
	Peran         string `json:"peran" db:"peran"`               // Admin, Developer, Karyawan
	IsAktif       bool   `json:"is_aktif" db:"is_aktif"`
	DibuatPada    time.Time `json:"dibuat_pada" db:"dibuat_pada"`
	TerakhirLogin *time.Time `json:"terakhir_login,omitempty" db:"terakhir_login"` // Pointer karena bisa NULL

	// Kredensial Lokal
	KataSandiHash *string `json:"-" db:"kata_sandi_hash"` // "-" = tidak di-serialize ke JSON (password tidak boleh ke frontend)

	// Kredensial OAuth2
	OAuthProvider  *string `json:"oauth_provider,omitempty" db:"oauth_provider"`
	OAuthUID       *string `json:"oauth_uid,omitempty" db:"oauth_uid"`
	URLFotoProfil  *string `json:"url_foto_profil,omitempty" db:"url_foto_profil"`
}

// PenggunaCreateRequest adalah struct untuk menerima request create user dari frontend
// Berbeda dengan Pengguna karena tidak semua field perlu di-input saat create
type PenggunaCreateRequest struct {
	NamaDepan    string `json:"nama_depan" binding:"required"`
	NamaBelakang string `json:"nama_belakang" binding:"required"`
	Email        string `json:"email" binding:"required,email"`
	Peran        string `json:"peran"`
	KataSandi    string `json:"kata_sandi" binding:"required,min=6"` // Plain password dari frontend
}

// PenggunaUpdateRequest adalah struct untuk update user
type PenggunaUpdateRequest struct {
	NamaDepan    *string `json:"nama_depan"`
	NamaBelakang *string `json:"nama_belakang"`
	Email        *string `json:"email"`
	KataSandi    *string `json:"kata_sandi"`
	Peran        *string `json:"peran"`
	IsAktif      *bool   `json:"is_aktif"`
}

// GetFullName mengembalikan nama lengkap pengguna
// Method ini attached ke struct Pengguna
func (p *Pengguna) GetFullName() string {
	return p.NamaDepan + " " + p.NamaBelakang
}
