# Backend Development Plan - pj-task-manager

**Framework**: Gin (Go)  
**Database**: PostgreSQL  
**Tanggal Mulai**: 18 Oktober 2025

---

## 📋 Struktur Folder Backend

```
backend/
├── cmd/
│   └── api/
│       └── main.go                 # Entry point aplikasi
├── internal/
│   ├── config/
│   │   └── config.go              # Load & manage environment config
│   ├── database/
│   │   ├── connection.go          # Database connection pool
│   │   └── migrations.go          # (Optional) Migration runner
│   ├── models/
│   │   ├── pengguna.go            # User entity/model
│   │   ├── proyek.go              # Project entity
│   │   ├── tugas.go               # Task entity
│   │   ├── penugasan_tugas.go    # Task assignment entity
│   │   └── komentar_aktivitas.go # Comment/activity entity
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
│   │   └── error_handler.go       # Error handling
│   └── utils/
│       ├── response.go            # Standardized JSON response
│       └── validator.go           # Input validation helpers
├── .env                            # Environment variables (TIDAK DI-COMMIT)
├── go.mod                          # Go module dependencies
├── go.sum                          # Dependency checksums
└── README.md                       # Backend documentation

```

---

## 🏗️ Arsitektur & Layer Pattern

### 1. **Entry Point (main.go)**

- Initialize config dari .env
- Setup database connection
- Initialize repositories
- Initialize handlers
- Setup Gin router & middleware
- Start HTTP server

### 2. **Config Layer** (`internal/config`)

- Membaca environment variables (.env)
- Menyediakan struct Config yang berisi semua setting
- Validasi config saat startup

### 3. **Database Layer** (`internal/database`)

- Connection pooling dengan `pgx` (PostgreSQL driver modern untuk Go)
- Health check database
- Graceful shutdown connection

### 4. **Models Layer** (`internal/models`)

- Struct definitions yang merepresentasikan tabel database
- JSON tags untuk serialization
- Validation tags (optional)

### 5. **Repository Layer** (`internal/repository`)

- **Pattern**: Data Access Layer
- Fungsi CRUD untuk setiap entity
- Query builder dan parameter handling
- Error handling untuk database operations

### 6. **Handler Layer** (`internal/handlers`)

- **Pattern**: Controller/Handler
- Parse HTTP request (JSON body, query params, URL params)
- Call repository functions
- Format response (success/error)

### 7. **Middleware Layer** (`internal/middleware`)

- CORS: Allow frontend access
- Logger: Log semua incoming requests
- Error Handler: Catch panics dan format error response
- (Future) Auth: JWT validation

### 8. **Utils Layer** (`internal/utils`)

- Helper functions untuk response formatting
- Validation helpers
- Common utilities

---

## 🔄 Request Flow

```
HTTP Request (Frontend/Client)
    ↓
Gin Router
    ↓
Middleware (CORS, Logger, Auth)
    ↓
Handler (Parse request, validate input)
    ↓
Repository (Execute SQL query)
    ↓
Database (PostgreSQL)
    ↓
Repository (Return data/error)
    ↓
Handler (Format response)
    ↓
Middleware (Log response)
    ↓
HTTP Response (JSON)
```

---

## 📦 Dependencies yang Digunakan

| Package                       | Kegunaan                                  |
| ----------------------------- | ----------------------------------------- |
| `github.com/gin-gonic/gin`    | Web framework untuk HTTP server & routing |
| `github.com/jackc/pgx/v5`     | PostgreSQL driver (lebih modern & cepat)  |
| `github.com/joho/godotenv`    | Load .env file                            |
| `github.com/gin-contrib/cors` | CORS middleware                           |

---

## 🚀 API Endpoints yang Akan Dibuat

### **Pengguna (Users)**

- `GET    /api/v1/pengguna` - List all users
- `GET    /api/v1/pengguna/:id` - Get user by ID
- `POST   /api/v1/pengguna` - Create new user
- `PUT    /api/v1/pengguna/:id` - Update user
- `DELETE /api/v1/pengguna/:id` - Delete user

### **Proyek (Projects)**

- `GET    /api/v1/proyek` - List all projects
- `GET    /api/v1/proyek/:id` - Get project by ID
- `POST   /api/v1/proyek` - Create new project
- `PUT    /api/v1/proyek/:id` - Update project
- `DELETE /api/v1/proyek/:id` - Delete project

### **Tugas (Tasks)**

- `GET    /api/v1/tugas` - List all tasks
- `GET    /api/v1/tugas/:id` - Get task by ID
- `GET    /api/v1/proyek/:id/tugas` - Get tasks by project
- `POST   /api/v1/tugas` - Create new task
- `PUT    /api/v1/tugas/:id` - Update task
- `DELETE /api/v1/tugas/:id` - Delete task

### **Penugasan Tugas (Task Assignments)**

- `POST   /api/v1/tugas/:id/assign` - Assign user to task
- `DELETE /api/v1/tugas/:id/assign/:user_id` - Unassign user

### **Komentar (Comments)**

- `GET    /api/v1/komentar` - List comments
- `GET    /api/v1/tugas/:id/komentar` - Get comments by task
- `GET    /api/v1/proyek/:id/komentar`- Get comments by project
- `POST   /api/v1/komentar` - Create comment
- `DELETE /api/v1/komentar/:id` - Delete comment

---

## 📝 Penjelasan Konsep Go untuk Pemula

### **1. Package & Import**

```go
package main  // Deklarasi package (mirip namespace)

import (
    "fmt"  // Import library standard
    "github.com/gin-gonic/gin"  // Import library eksternal
)
```

### **2. Struct (seperti Class di OOP)**

```go
type Pengguna struct {
    PenggunaID   int    `json:"pengguna_id"`  // Field dengan JSON tag
    NamaDepan    string `json:"nama_depan"`
    Email        string `json:"email"`
}
```

### **3. Function & Method**

```go
// Function biasa
func HelloWorld() {
    fmt.Println("Hello")
}

// Method (function yang attached ke struct)
func (p *Pengguna) GetFullName() string {
    return p.NamaDepan + " " + p.NamaBelakang
}
```

### **4. Error Handling**

Go tidak pakai try-catch, tapi return error:

```go
func GetUser(id int) (*Pengguna, error) {
    // Jika error
    if id < 0 {
        return nil, errors.New("ID tidak valid")
    }

    // Jika success
    return &Pengguna{}, nil
}

// Cara pakai:
user, err := GetUser(1)
if err != nil {
    // Handle error
    log.Println(err)
    return
}
// Use user
fmt.Println(user.NamaDepan)
```

### **5. Pointer**

- `*` = pointer (alamat memori)
- `&` = ambil alamat dari variable

```go
var user Pengguna
user.NamaDepan = "John"

// Pass by reference (hemat memory)
func UpdateUser(u *Pengguna) {
    u.NamaDepan = "Jane"
}
```

---

## ✅ Checklist Development

- [ ] Setup Go module & install dependencies
- [ ] Buat struktur folder
- [ ] Config loader (.env)
- [ ] Database connection
- [ ] Models untuk semua entities
- [ ] Repository layer (CRUD operations)
- [ ] Handlers (HTTP endpoints)
- [ ] Middleware (CORS, Logger)
- [ ] Main.go (wire up all components)
- [ ] Test manual dengan Postman/curl
- [ ] Documentation

---

## 🧪 Cara Testing

### 1. **Setup Database**

```sql
-- Jalankan DDL dari DATABASE_SCHEMA.md
psql -U postgres -d pm -f .md/DATABASE_SCHEMA.md
```

### 2. **Run Backend**

```bash
cd backend
go run cmd/api/main.go
```

### 3. **Test dengan curl**

```bash
# Create user
curl -X POST http://localhost:5599/api/v1/pengguna \
  -H "Content-Type: application/json" \
  -d '{"nama_depan":"John","nama_belakang":"Doe","email":"john@example.com"}'

# Get all users
curl http://localhost:5599/api/v1/pengguna
```

---

**Status**: 🚧 In Progress  
**Last Updated**: 18 Oktober 2025
