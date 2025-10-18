# Backend - pj-task-manager

Backend REST API untuk aplikasi manajemen proyek menggunakan **Gin Framework (Go)** dan **PostgreSQL**.

## 📋 Tech Stack

- **Language**: Go 1.21+
- **Framework**: Gin Web Framework
- **Database**: PostgreSQL 14+
- **Driver**: pgx/v5 (native PostgreSQL driver)
- **Environment**: godotenv

---

## 🏗️ Struktur Folder

```
backend/
├── cmd/api/
│   └── main.go                    # Entry point aplikasi
├── internal/
│   ├── config/
│   │   └── config.go              # Load environment variables
│   ├── database/
│   │   └── connection.go          # Database connection pool
│   ├── models/
│   │   ├── pengguna.go            # User model
│   │   ├── proyek.go              # Project model
│   │   ├── tugas.go               # Task model
│   │   ├── penugasan_tugas.go    # Task assignment model
│   │   └── komentar_aktivitas.go # Comment model
│   ├── repository/
│   │   ├── pengguna_repository.go    # User DB operations
│   │   ├── proyek_repository.go      # Project DB operations
│   │   ├── tugas_repository.go       # Task DB operations
│   │   └── komentar_repository.go    # Comment DB operations
│   ├── handlers/
│   │   ├── pengguna_handler.go    # User HTTP handlers
│   │   ├── proyek_handler.go      # Project HTTP handlers
│   │   ├── tugas_handler.go       # Task HTTP handlers
│   │   └── komentar_handler.go    # Comment HTTP handlers
│   ├── middleware/
│   │   ├── cors.go                # CORS middleware
│   │   ├── logger.go              # Request logging
│   │   └── error_handler.go       # Error handling & recovery
│   └── utils/
│       └── response.go            # Standardized JSON response
├── .env                            # Environment variables (TIDAK DI-COMMIT!)
├── go.mod                          # Go module dependencies
├── go.sum                          # Dependency checksums
└── README.md                       # This file
```

---

## 🚀 Cara Setup & Run

### 1. Install Go

Download dan install Go dari [https://go.dev/dl/](https://go.dev/dl/)

Verifikasi instalasi:

```bash
go version
```

### 2. Clone & Navigate

```bash
cd backend
```

### 3. Install Dependencies

```bash
go mod download
```

Atau jika error, gunakan:

```bash
go mod tidy
```

### 4. Setup Database

Buat database PostgreSQL:

```sql
CREATE DATABASE pm;
```

Jalankan DDL schema (file ada di `.md/DATABASE_SCHEMA.md`):

```bash
psql -U postgres -d pm -f ../.md/DATABASE_SCHEMA.md
```

### 5. Configure Environment

File `.env` sudah ada dengan config:

```env
PORT=5599

PG_DB_HOST=localhost
PG_DB_PORT=5432
PG_DB_USER=postgres
PG_DB_PASSWORD=123456
PG_DB_NAME=pm
```

Sesuaikan jika perlu.

### 6. Run Server

```bash
go run cmd/api/main.go
```

Atau build & run:

```bash
go build -o bin/server cmd/api/main.go
./bin/server
```

Server akan jalan di: **http://localhost:5599**

---

## 📡 API Endpoints

### Base URL

```
http://localhost:5599/api/v1
```

### Health Check

```http
GET /health
```

---

### � Authentication

#### Register (Sign Up)

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "nama_depan": "Jane",
  "nama_belakang": "Smith",
  "email": "jane@example.com",
  "kata_sandi": "password123",
  "peran": "Developer"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "pengguna_id": 2,
      "nama_depan": "Jane",
      "nama_belakang": "Smith",
      "email": "jane@example.com",
      "peran": "Developer",
      "is_aktif": true,
      "dibuat_pada": "2025-10-18T10:00:00Z"
    },
    "message": "Registrasi berhasil, Anda sudah login"
  }
}
```

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "kata_sandi": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "pengguna_id": 2,
      "nama_depan": "Jane",
      "nama_belakang": "Smith",
      "email": "jane@example.com",
      "peran": "Developer",
      "is_aktif": true,
      "terakhir_login": "2025-10-18T14:30:00Z"
    },
    "message": "Login berhasil"
  }
}
```

**Note:** Token yang didapat harus disimpan dan digunakan untuk request yang memerlukan autentikasi (future implementation).

---

### �👥 Pengguna (Users)

#### Get All Users

```http
GET /api/v1/pengguna
```

**Response:**

```json
{
  "success": true,
  "message": "Berhasil mengambil data pengguna",
  "data": {
    "pengguna": [
      {
        "pengguna_id": 1,
        "nama_depan": "John",
        "nama_belakang": "Doe",
        "email": "john@example.com",
        "peran": "Admin",
        "is_aktif": true,
        "dibuat_pada": "2025-10-18T10:00:00Z"
      }
    ],
    "total": 1
  }
}
```

#### Get User by ID

```http
GET /api/v1/pengguna/:id
```

#### Create User

```http
POST /api/v1/pengguna
Content-Type: application/json

{
  "nama_depan": "Jane",
  "nama_belakang": "Smith",
  "email": "jane@example.com",
  "kata_sandi": "password123",
  "peran": "Developer"
}
```

#### Update User

```http
PUT /api/v1/pengguna/:id
Content-Type: application/json

{
  "nama_depan": "Jane Updated",
  "is_aktif": false
}
```

#### Delete User (Soft Delete)

```http
DELETE /api/v1/pengguna/:id
```

---

### 📁 Proyek (Projects)

#### Get All Projects

```http
GET /api/v1/proyek
```

#### Get Project by ID

```http
GET /api/v1/proyek/:id
```

#### Get Tasks by Project

```http
GET /api/v1/proyek/:id/tugas
```

#### Get Comments by Project

```http
GET /api/v1/proyek/:id/komentar
```

#### Create Project

```http
POST /api/v1/proyek
Content-Type: application/json

{
  "nama_proyek": "Website Redesign",
  "deskripsi": "Redesign company website",
  "tanggal_mulai": "2025-10-20",
  "tanggal_target_selesai": "2025-12-31",
  "status": "Dalam Proses",
  "manajer_proyek_id": 1
}
```

#### Update Project

```http
PUT /api/v1/proyek/:id
Content-Type: application/json

{
  "status": "Selesai",
  "tanggal_aktual_selesai": "2025-11-15"
}
```

#### Delete Project

```http
DELETE /api/v1/proyek/:id
```

---

### ✅ Tugas (Tasks)

#### Get All Tasks

```http
GET /api/v1/tugas
```

#### Get Task by ID (with assigned users)

```http
GET /api/v1/tugas/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Berhasil mengambil data tugas",
  "data": {
    "tugas_id": 1,
    "proyek_id": 1,
    "judul": "Design Homepage",
    "status": "Sedang Dikerjakan",
    "prioritas": "Tinggi",
    "assigned_users": [
      {
        "pengguna_id": 2,
        "nama_depan": "Jane",
        "email": "jane@example.com"
      }
    ]
  }
}
```

#### Get Comments by Task

```http
GET /api/v1/tugas/:id/komentar
```

#### Create Task

```http
POST /api/v1/tugas
Content-Type: application/json

{
  "proyek_id": 1,
  "judul": "Design Homepage",
  "deskripsi": "Create mockup for homepage",
  "tanggal_jatuh_tempo": "2025-10-25",
  "prioritas": "Tinggi",
  "status": "Baru",
  "waktu_perkiraan_jam": 8.5
}
```

#### Update Task

```http
PUT /api/v1/tugas/:id
Content-Type: application/json

{
  "status": "Selesai"
}
```

#### Delete Task

```http
DELETE /api/v1/tugas/:id
```

#### Assign User to Task

```http
POST /api/v1/tugas/:id/assign
Content-Type: application/json

{
  "pengguna_id": 2
}
```

#### Unassign User from Task

```http
DELETE /api/v1/tugas/:id/assign/:user_id
```

---

### 💬 Komentar (Comments)

#### Get All Comments

```http
GET /api/v1/komentar
```

#### Create Comment

```http
POST /api/v1/komentar
Content-Type: application/json

{
  "pengguna_id": 1,
  "isi_komentar": "Great progress on this task!",
  "tugas_id": 1
}
```

atau untuk komentar proyek:

```json
{
  "pengguna_id": 1,
  "isi_komentar": "Project is on track",
  "proyek_id": 1
}
```

#### Delete Comment

```http
DELETE /api/v1/komentar/:id
```

---

## 🧪 Testing dengan curl

### Register User

```bash
curl -X POST http://localhost:5599/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nama_depan": "Test",
    "nama_belakang": "User",
    "email": "test@example.com",
    "kata_sandi": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5599/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "kata_sandi": "password123"
  }'
```

### Create User

```bash
curl -X POST http://localhost:5599/api/v1/pengguna \
  -H "Content-Type: application/json" \
  -d '{
    "nama_depan": "Test",
    "nama_belakang": "User",
    "email": "test@example.com",
    "kata_sandi": "password123"
  }'
```

### Get All Users

```bash
curl http://localhost:5599/api/v1/pengguna
```

### Create Project

```bash
curl -X POST http://localhost:5599/api/v1/proyek \
  -H "Content-Type: application/json" \
  -d '{
    "nama_proyek": "API Development",
    "tanggal_mulai": "2025-10-18",
    "manajer_proyek_id": 1
  }'
```

---

## 🔧 Development Tips

### Debug Mode

Ubah mode Gin di `main.go`:

```go
gin.SetMode(gin.DebugMode) // Show detailed logs
```

### Hot Reload (Optional)

Install air untuk hot reload:

```bash
go install github.com/cosmtrek/air@latest
air
```

### Database Migrations (Future)

Untuk production, gunakan migration tool seperti:

- **golang-migrate**
- **goose**

---

## 📝 Penjelasan Konsep Go

### 1. **Package & Import**

```go
package main  // Deklarasi package (seperti namespace)

import (
    "fmt"  // Import library standard
    "github.com/gin-gonic/gin"  // Import external library
)
```

### 2. **Struct** (seperti Class)

```go
type Pengguna struct {
    PenggunaID int    `json:"pengguna_id"`  // Field dengan JSON tag
    NamaDepan  string `json:"nama_depan"`
}
```

### 3. **Error Handling**

Go tidak pakai try-catch, tapi return error:

```go
user, err := GetUser(1)
if err != nil {
    // Handle error
    log.Println(err)
    return
}
// Use user
fmt.Println(user.NamaDepan)
```

### 4. **Pointer**

- `*` = pointer (reference ke alamat memori)
- `&` = ambil alamat dari variable

```go
func UpdateUser(u *Pengguna) {  // Terima pointer
    u.NamaDepan = "Updated"
}

user := &Pengguna{}  // Buat pointer ke Pengguna
```

### 5. **Goroutine** (Concurrency)

```go
go func() {
    // This runs in background
    fmt.Println("Hello from goroutine")
}()
```

---

## 🛠️ Troubleshooting

### Port Already in Use

```bash
# Kill process di port 5599 (macOS/Linux)
lsof -ti:5599 | xargs kill -9
```

### Database Connection Error

- Pastikan PostgreSQL running
- Cek credentials di `.env`
- Test connection:

```bash
psql -U postgres -d pm -c "SELECT 1"
```

### Import Error

```bash
go mod tidy
go mod download
```

---

## 📚 Resources

- [Go Documentation](https://go.dev/doc/)
- [Gin Framework](https://gin-gonic.com/docs/)
- [pgx Documentation](https://pkg.go.dev/github.com/jackc/pgx/v5)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## 👨‍💻 Developed By

Backend API for Project Management System  
**Framework**: Gin (Go) + PostgreSQL  
**Date**: October 2025
