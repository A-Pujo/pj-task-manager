-- ========================================
-- DATABASE SCHEMA FOR TASK MANAGER
-- Compatible with Backend Go Code
-- ========================================

-- Database: pm
-- Run as postgres user

-- 1. TABEL PENGGUNA (Users)
-- Stores user information with local credentials and OAuth2 support

CREATE TABLE IF NOT EXISTS pengguna (
    pengguna_id SERIAL PRIMARY KEY,
    nama_depan VARCHAR(100) NOT NULL,
    nama_belakang VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    peran VARCHAR(50) DEFAULT 'member', -- 'admin', 'member', etc
    is_aktif BOOLEAN NOT NULL DEFAULT TRUE,
    dibuat_pada TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    terakhir_login TIMESTAMP WITH TIME ZONE,
    
    -- Local Credentials
    kata_sandi_hash VARCHAR(255),
    
    -- OAuth2 Credentials (Google, etc)
    oauth_provider VARCHAR(50),
    oauth_uid VARCHAR(255) UNIQUE,
    url_foto_profil TEXT
);

-- Index for faster email lookup
CREATE INDEX IF NOT EXISTS idx_pengguna_email ON pengguna(email);

-- 2. TABEL PROYEK (Projects)
-- Projects owned by users

CREATE TABLE IF NOT EXISTS proyek (
    proyek_id SERIAL PRIMARY KEY,
    nama_proyek VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE, -- Combined target/actual date
    status VARCHAR(50) NOT NULL DEFAULT 'aktif', -- 'aktif', 'selesai', 'pending'
    
    -- Foreign Key to pengguna
    pengguna_id INTEGER NOT NULL REFERENCES pengguna(pengguna_id) ON DELETE CASCADE,
    
    dibuat_pada TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    diperbarui_pada TIMESTAMP WITH TIME ZONE
);

-- Index for faster project queries
CREATE INDEX IF NOT EXISTS idx_proyek_pengguna ON proyek(pengguna_id);
CREATE INDEX IF NOT EXISTS idx_proyek_status ON proyek(status);

-- 3. TABEL TUGAS (Tasks)
-- Tasks within projects

CREATE TABLE IF NOT EXISTS tugas (
    tugas_id SERIAL PRIMARY KEY,
    
    -- Foreign Key to proyek
    proyek_id INTEGER NOT NULL REFERENCES proyek(proyek_id) ON DELETE CASCADE,
    
    nama_tugas VARCHAR(255) NOT NULL, -- Changed from 'judul'
    deskripsi TEXT,
    prioritas VARCHAR(20) DEFAULT 'sedang', -- 'rendah', 'sedang', 'tinggi', 'urgent'
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'dalam_proses', 'selesai', 'ditunda'
    tanggal_mulai DATE,
    tanggal_deadline DATE, -- Changed from 'tanggal_jatuh_tempo'
    
    dibuat_pada TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    diperbarui_pada TIMESTAMP WITH TIME ZONE
);

-- Indexes for faster task queries
CREATE INDEX IF NOT EXISTS idx_tugas_proyek ON tugas(proyek_id);
CREATE INDEX IF NOT EXISTS idx_tugas_status ON tugas(status);
CREATE INDEX IF NOT EXISTS idx_tugas_prioritas ON tugas(prioritas);

-- 4. TABEL PENUGASAN TUGAS (Task Assignments)
-- Many-to-Many relationship between Tasks and Users

CREATE TABLE IF NOT EXISTS penugasan_tugas (
    tugas_id INTEGER NOT NULL REFERENCES tugas(tugas_id) ON DELETE CASCADE,
    pengguna_id INTEGER NOT NULL REFERENCES pengguna(pengguna_id) ON DELETE CASCADE,
    ditugaskan_pada TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Composite Primary Key (prevents duplicate assignments)
    PRIMARY KEY (tugas_id, pengguna_id)
);

-- 5. TABEL KOMENTAR AKTIVITAS (Comments/Activity Log)
-- Comments on Tasks or Projects

CREATE TABLE IF NOT EXISTS komentar_aktivitas (
    komentar_id SERIAL PRIMARY KEY,
    
    -- Foreign Key to pengguna (who made the comment)
    pengguna_id INTEGER NOT NULL REFERENCES pengguna(pengguna_id) ON DELETE CASCADE,
    
    -- Optional: Either project_id OR task_id (or both)
    proyek_id INTEGER REFERENCES proyek(proyek_id) ON DELETE CASCADE,
    tugas_id INTEGER REFERENCES tugas(tugas_id) ON DELETE CASCADE,
    
    komentar TEXT NOT NULL,
    dibuat_pada TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for faster comment queries
CREATE INDEX IF NOT EXISTS idx_komentar_pengguna ON komentar_aktivitas(pengguna_id);
CREATE INDEX IF NOT EXISTS idx_komentar_proyek ON komentar_aktivitas(proyek_id);
CREATE INDEX IF NOT EXISTS idx_komentar_tugas ON komentar_aktivitas(tugas_id);

-- ========================================
-- SAMPLE DATA (Optional - for testing)
-- ========================================

-- Sample User (password: password123)
-- INSERT INTO pengguna (nama_depan, nama_belakang, email, peran, kata_sandi_hash)
-- VALUES ('Admin', 'User', 'admin@example.com', 'admin', '$2a$10$YourHashedPasswordHere');

-- ========================================
-- VIEWS (Optional - for reporting)
-- ========================================

-- View: Proyek dengan nama pemilik
CREATE OR REPLACE VIEW v_proyek_detail AS
SELECT 
    p.proyek_id,
    p.nama_proyek,
    p.deskripsi,
    p.tanggal_mulai,
    p.tanggal_selesai,
    p.status,
    p.dibuat_pada,
    u.nama_depan || ' ' || u.nama_belakang AS pemilik_proyek,
    u.email AS pemilik_email
FROM proyek p
JOIN pengguna u ON p.pengguna_id = u.pengguna_id;

-- View: Tugas dengan informasi proyek
CREATE OR REPLACE VIEW v_tugas_detail AS
SELECT 
    t.tugas_id,
    t.nama_tugas,
    t.deskripsi,
    t.prioritas,
    t.status,
    t.tanggal_mulai,
    t.tanggal_deadline,
    t.dibuat_pada,
    p.nama_proyek,
    p.proyek_id
FROM tugas t
JOIN proyek p ON t.proyek_id = p.proyek_id;

-- ========================================
-- GRANTS (Adjust based on your user)
-- ========================================

-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
