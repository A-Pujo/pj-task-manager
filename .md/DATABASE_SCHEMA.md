-- FILE DDL POSTGRESQL UNTUK MANAJEMEN PROYEK

-- Catatan: Query ini diurutkan berdasarkan dependensi (kunci asing)
-- sehingga dapat dijalankan secara berurutan tanpa error.
-- seluruh tabel berada di dalam skema pm.pm2025

-- 1. TABEL PENGGUNA (Users) -- Menyimpan data pengguna, mendukung kredensial lokal dan OAuth2

CREATE TABLE pengguna (
pengguna_id SERIAL PRIMARY KEY,
nama_depan VARCHAR(100) NOT NULL,
nama_belakang VARCHAR(100) NOT NULL,
email VARCHAR(255) UNIQUE NOT NULL,
peran VARCHAR(50) DEFAULT 'Karyawan', -- Contoh: 'Admin', 'Developer', 'Karyawan'
is_aktif BOOLEAN NOT NULL DEFAULT TRUE,
dibuat_pada TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
terakhir_login TIMESTAMP WITH TIME ZONE,

-- Kredensial Lokal
kata_sandi_hash VARCHAR(255),

-- Kredensial OAuth2 (Google, dll.)
oauth_provider VARCHAR(50),
oauth_uid VARCHAR(255) UNIQUE, -- ID unik dari penyedia OAuth (misalnya Google ID)
url_foto_profil TEXT

);

-- 2. TABEL PROYEK (Projects) -- Memiliki kunci asing ke pengguna (manajer_proyek_id)

CREATE TABLE proyek (
proyek_id SERIAL PRIMARY KEY,
nama_proyek VARCHAR(255) NOT NULL,
deskripsi TEXT,
tanggal_mulai DATE NOT NULL,
tanggal_target_selesai DATE,
tanggal_aktual_selesai DATE,
status VARCHAR(50) NOT NULL DEFAULT 'Dalam Proses', -- Contoh: 'Dalam Proses', 'Selesai', 'Tertunda'

-- Kunci Asing ke tabel pengguna (ON DELETE SET NULL: Jika manajer dihapus, kolom ini menjadi NULL)
manajer_proyek_id INTEGER REFERENCES pengguna(pengguna_id) ON DELETE SET NULL,

dibuat_pada TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()

);

-- 3. TABEL TUGAS (Tasks) -- Tugas yang terikat pada satu proyek

CREATE TABLE tugas (
tugas_id SERIAL PRIMARY KEY,

-- Kunci Asing ke tabel proyek (ON DELETE CASCADE: Jika proyek dihapus, semua tugas ikut dihapus)
proyek_id INTEGER NOT NULL REFERENCES proyek(proyek_id) ON DELETE CASCADE,

judul VARCHAR(255) NOT NULL,
deskripsi TEXT,
tanggal_jatuh_tempo DATE,
prioritas VARCHAR(20) DEFAULT 'Sedang', -- Contoh: 'Tinggi', 'Sedang', 'Rendah'
status VARCHAR(50) NOT NULL DEFAULT 'Baru', -- Contoh: 'Baru', 'Sedang Dikerjakan', 'Selesai'
waktu_perkiraan_jam NUMERIC(5,2)

);

-- 4. TABEL PENUGASAN TUGAS (Task Assignments) -- Tabel penghubung Many-to-Many (Tugas <-> Pengguna)

CREATE TABLE penugasan_tugas (
tugas_id INTEGER NOT NULL REFERENCES tugas(tugas_id) ON DELETE CASCADE,
pengguna_id INTEGER NOT NULL REFERENCES pengguna(pengguna_id) ON DELETE CASCADE,
ditugaskan_pada TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

-- Kunci Primer Gabungan (mencegah duplikasi penugasan)
PRIMARY KEY (tugas_id, pengguna_id)

);

-- 5. TABEL KOMENTAR AKTIVITAS (Comments/Activity Log) -- Melacak komentar pada Tugas atau Proyek

CREATE TABLE komentar_aktivitas (
komentar_id SERIAL PRIMARY KEY,

-- Kunci Asing ke pengguna (siapa yang berkomentar)
pengguna_id INTEGER NOT NULL REFERENCES pengguna(pengguna_id) ON DELETE CASCADE,
isi_komentar TEXT NOT NULL,
waktu_dibuat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

-- Kunci Asing opsional (hanya salah satu yang akan terisi)
tugas_id INTEGER REFERENCES tugas(tugas_id) ON DELETE CASCADE,
proyek_id INTEGER REFERENCES proyek(proyek_id) ON DELETE CASCADE,

-- Constraint untuk memastikan komentar harus terkait dengan Tugas ATAU Proyek
CONSTRAINT check_target_entity CHECK (
(tugas_id IS NOT NULL AND proyek_id IS NULL) OR
(tugas_id IS NULL AND proyek_id IS NOT NULL)
)

);
