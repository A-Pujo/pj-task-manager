# 🔧 Memperbaiki Error 500 - Database Schema Mismatch

## ❌ Masalah

Backend mengembalikan error **500 Internal Server Error** saat register karena:

- Column names di database tidak match dengan backend code
- DATABASE_SCHEMA.md (lama) menggunakan nama kolom yang berbeda

## ✅ Solusi

### Option 1: Create New Database (RECOMMENDED)

1. **Drop & Recreate Database:**

```bash
# Connect to PostgreSQL
psql -U postgres

# Drop existing database
DROP DATABASE IF EXISTS pm;

# Create new database
CREATE DATABASE pm;

# Connect to new database
\c pm

# Run the correct schema
\i /Users/djpb/Documents/Pujo/Project/pj-task-manager/backend/DATABASE_SCHEMA_CORRECT.sql

# Exit
\q
```

2. **Restart Backend:**

```bash
cd backend
go run cmd/api/main.go
```

3. **Test Register:**

- Go to http://localhost:5577
- Click "Daftar Sekarang"
- Fill the form and register

### Option 2: Update Existing Database

Jika database sudah memiliki data yang ingin dipertahankan:

```sql
-- Connect to database
psql -U postgres -d pm

-- Update table proyek
ALTER TABLE proyek
  RENAME COLUMN manajer_proyek_id TO pengguna_id;

ALTER TABLE proyek
  DROP COLUMN IF EXISTS tanggal_target_selesai,
  DROP COLUMN IF EXISTS tanggal_aktual_selesai;

ALTER TABLE proyek
  ADD COLUMN IF NOT EXISTS tanggal_selesai DATE;

-- Update table tugas
ALTER TABLE tugas
  RENAME COLUMN judul TO nama_tugas;

ALTER TABLE tugas
  RENAME COLUMN tanggal_jatuh_tempo TO tanggal_deadline;

ALTER TABLE tugas
  DROP COLUMN IF EXISTS waktu_perkiraan_jam;

ALTER TABLE tugas
  ADD COLUMN IF NOT EXISTS tanggal_mulai DATE;

-- Update default values
ALTER TABLE pengguna
  ALTER COLUMN peran SET DEFAULT 'member';

ALTER TABLE proyek
  ALTER COLUMN status SET DEFAULT 'aktif';

ALTER TABLE tugas
  ALTER COLUMN status SET DEFAULT 'pending',
  ALTER COLUMN prioritas SET DEFAULT 'sedang';
```

## 📊 Perbedaan Schema

### Tabel PENGGUNA

- ✅ Sudah benar, tidak ada perubahan

### Tabel PROYEK

| Schema Lama              | Schema Baru       | Status     |
| ------------------------ | ----------------- | ---------- |
| `manajer_proyek_id`      | `pengguna_id`     | ⚠️ Renamed |
| `tanggal_target_selesai` | `tanggal_selesai` | ⚠️ Merged  |
| `tanggal_aktual_selesai` | _(removed)_       | ⚠️ Removed |

### Tabel TUGAS

| Schema Lama           | Schema Baru        | Status     |
| --------------------- | ------------------ | ---------- |
| `judul`               | `nama_tugas`       | ⚠️ Renamed |
| `tanggal_jatuh_tempo` | `tanggal_deadline` | ⚠️ Renamed |
| `waktu_perkiraan_jam` | _(removed)_        | ⚠️ Removed |
| _(not exists)_        | `tanggal_mulai`    | ✅ Added   |

### Tabel PENUGASAN_TUGAS & KOMENTAR_AKTIVITAS

- ✅ Sudah benar, tidak ada perubahan

## 🧪 Testing After Fix

1. **Register User:**

```bash
curl -X POST http://localhost:5599/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nama_depan": "Test",
    "nama_belakang": "User",
    "email": "test@example.com",
    "kata_sandi": "password123",
    "peran": "member"
  }'
```

Expected response:

```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "pengguna_id": 1,
      "nama_depan": "Test",
      ...
    }
  }
}
```

2. **Login:**

```bash
curl -X POST http://localhost:5599/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "kata_sandi": "password123"
  }'
```

3. **Test in Browser:**

- Go to http://localhost:5577
- Register new account
- Login
- Create project
- Create task

## 📝 Notes

- File `DATABASE_SCHEMA_CORRECT.sql` sudah dibuat dengan schema yang benar
- Default values updated untuk match backend expectations:
  - `pengguna.peran` → 'member'
  - `proyek.status` → 'aktif'
  - `tugas.status` → 'pending'
  - `tugas.prioritas` → 'sedang'
- Old `DATABASE_SCHEMA.md` di folder `.md/` dapat diabaikan

## 🎯 Quick Fix Commands

```bash
# 1. Drop & recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS pm;"
psql -U postgres -c "CREATE DATABASE pm;"

# 2. Run correct schema
psql -U postgres -d pm -f backend/DATABASE_SCHEMA_CORRECT.sql

# 3. Restart backend
cd backend && go run cmd/api/main.go
```

Done! Error 500 should be fixed now. 🚀
