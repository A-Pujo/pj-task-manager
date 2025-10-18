# Quick Start Guide - Backend Setup

## 🚀 Langkah-langkah Setup (untuk pemula Go)

### 1. Install Go

**macOS (menggunakan Homebrew):**

```bash
brew install go
```

**Atau download dari:** https://go.dev/dl/

Verifikasi instalasi:

```bash
go version
# Output: go version go1.21.x darwin/amd64 (atau versi terbaru)
```

---

### 2. Setup Database

Pastikan PostgreSQL sudah running:

```bash
# Check PostgreSQL status (macOS)
brew services list | grep postgresql

# Jika belum running, start:
brew services start postgresql
```

Buat database:

```bash
# Login ke PostgreSQL
psql postgres

# Di dalam psql console:
CREATE DATABASE pm;
\q
```

Jalankan schema DDL:

```bash
cd /Users/djpb/Documents/Pujo/Project/pj-task-manager
psql -U postgres -d pm -f .md/DATABASE_SCHEMA.md
```

---

### 3. Install Dependencies

```bash
cd backend
go mod download
```

Jika ada error, coba:

```bash
go mod tidy
```

---

### 4. Cek File .env

Pastikan file `.env` sudah benar:

```bash
cat .env
```

Output harus seperti ini:

```
PORT=5599

PG_DB_HOST=localhost
PG_DB_PORT=5432
PG_DB_USER=postgres
PG_DB_PASSWORD=123456
PG_DB_NAME=pm
```

Sesuaikan `PG_DB_PASSWORD` dengan password PostgreSQL Anda.

---

### 5. Run Server

```bash
go run cmd/api/main.go
```

**Output yang diharapkan:**

```
📝 Loading configuration...
✅ Config loaded. Server will run on port 5599
🔌 Connecting to database...
✅ Database connection pool berhasil dibuat
✅ Database connected successfully
✅ Repositories initialized
✅ Handlers initialized
✅ Middleware applied
✅ Routes configured
🚀 Server starting on http://localhost:5599
📡 API endpoints available at http://localhost:5599/api/v1
```

---

### 6. Test API

**Test Health Check:**

```bash
curl http://localhost:5599/health
```

**Output:**

```json
{
  "status": "OK",
  "message": "Server is running"
}
```

**Create User:**

```bash
curl -X POST http://localhost:5599/api/v1/pengguna \
  -H "Content-Type: application/json" \
  -d '{
    "nama_depan": "John",
    "nama_belakang": "Doe",
    "email": "john@example.com",
    "kata_sandi": "password123"
  }'
```

**Get All Users:**

```bash
curl http://localhost:5599/api/v1/pengguna
```

---

## 🐛 Common Issues

### Issue 1: `go: command not found`

**Solution:** Go belum terinstall atau belum di PATH.

```bash
# Install Go
brew install go

# Atau tambahkan ke PATH di ~/.zshrc atau ~/.bash_profile:
export PATH=$PATH:/usr/local/go/bin
```

### Issue 2: `database connection failed`

**Solution:** PostgreSQL tidak running atau password salah.

```bash
# Start PostgreSQL
brew services start postgresql

# Reset password jika lupa
psql postgres
ALTER USER postgres PASSWORD '123456';
```

### Issue 3: `port 5599 already in use`

**Solution:** Kill process yang pakai port tersebut.

```bash
lsof -ti:5599 | xargs kill -9
```

### Issue 4: `package not found` errors

**Solution:** Download dependencies.

```bash
cd backend
go mod download
go mod tidy
```

---

## 📖 Penjelasan Alur Kode

### 1. Request Flow

```
Client (Frontend/Postman)
    ↓
HTTP Request ke http://localhost:5599/api/v1/pengguna
    ↓
Gin Router (main.go) → mencocokkan route
    ↓
Middleware (CORS, Logger, Recovery) → dieksekusi berurutan
    ↓
Handler (pengguna_handler.go) → GetAll() function
    ↓
Repository (pengguna_repository.go) → GetAll() query database
    ↓
PostgreSQL Database → eksekusi SELECT query
    ↓
Repository → return []Pengguna atau error
    ↓
Handler → format response JSON
    ↓
Middleware (Logger) → log response
    ↓
HTTP Response (JSON) ke Client
```

### 2. Layer Explanation

**Config Layer** (`internal/config/`)

- Membaca file `.env`
- Menyediakan config untuk database, port, dll
- Dipanggil pertama kali saat aplikasi start

**Database Layer** (`internal/database/`)

- Membuat connection pool ke PostgreSQL
- Pool = kumpulan koneksi yang bisa dipakai berulang (hemat resource)
- Max 25 koneksi aktif, min 5 standby

**Models Layer** (`internal/models/`)

- Struct definition untuk setiap tabel
- Struct = blueprint data (seperti class di OOP)
- JSON tags untuk serialization (convert struct ↔ JSON)

**Repository Layer** (`internal/repository/`)

- CRUD operations (Create, Read, Update, Delete)
- Query builder untuk PostgreSQL
- Error handling untuk database operations
- Pattern ini memisahkan business logic dari data access

**Handler Layer** (`internal/handlers/`)

- Controller yang terima HTTP request
- Parse request body/params
- Call repository functions
- Format response JSON
- HTTP status codes (200 OK, 201 Created, 404 Not Found, dll)

**Middleware Layer** (`internal/middleware/`)

- CORS: izinkan frontend akses API
- Logger: log semua request (method, path, duration, status)
- Recovery: tangkap panic agar server tidak crash

**Utils Layer** (`internal/utils/`)

- Helper functions untuk response formatting
- Standardized JSON response structure

---

## 🔑 Key Concepts untuk Pemula Go

### 1. Pointer (`*` dan `&`)

```go
// Tanpa pointer (copy value)
func updateNameCopy(u Pengguna) {
    u.NamaDepan = "Changed"  // Hanya ubah copy, original tidak berubah
}

// Dengan pointer (modify original)
func updateNamePointer(u *Pengguna) {
    u.NamaDepan = "Changed"  // Ubah original
}

user := Pengguna{NamaDepan: "John"}
updateNameCopy(user)     // user.NamaDepan masih "John"
updateNamePointer(&user) // user.NamaDepan jadi "Changed"
```

### 2. Error Handling

```go
// Go tidak pakai try-catch, tapi return error
result, err := DoSomething()
if err != nil {
    // Handle error
    log.Println("Error:", err)
    return
}
// Use result jika tidak ada error
fmt.Println(result)
```

### 3. Struct Tags

```go
type Pengguna struct {
    PenggunaID int `json:"pengguna_id" db:"pengguna_id"`
    // `json:"pengguna_id"` → field name saat di-convert ke JSON
    // `db:"pengguna_id"`   → column name di database
}
```

### 4. Context

```go
ctx := c.Request.Context()
// Context dipakai untuk:
// - Timeout (request dibatalkan jika terlalu lama)
// - Cancellation (bisa cancel request di tengah jalan)
// - Passing values (jarang dipakai)
```

### 5. Goroutine (Background Process)

```go
go func() {
    // Code ini jalan di background
    // Main program tidak wait
}()
```

---

## 📚 Next Steps

1. **Test semua endpoints** menggunakan Postman atau curl
2. **Pelajari error responses** - coba request dengan data invalid
3. **Baca kode di `main.go`** - pahami alur startup
4. **Explore repository layer** - lihat bagaimana query SQL dibuat
5. **Try modify** - tambah field baru atau endpoint baru

---

## 🆘 Need Help?

- Baca `backend/README.md` untuk dokumentasi lengkap
- Cek `.md/BACKEND_DEVELOPMENT.md` untuk penjelasan arsitektur
- Google error message jika ada issue
- Go documentation: https://go.dev/doc/

---

**Happy Coding! 🎉**
