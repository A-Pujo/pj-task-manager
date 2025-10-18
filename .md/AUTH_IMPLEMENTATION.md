# 🔐 Authentication Implementation - JWT Login & Register

## ✅ Update Summary

Backend telah di-update dengan fitur **Authentication** menggunakan JWT (JSON Web Token).

---

## 📦 Yang Ditambahkan

### 1. **File Baru**

#### `/internal/handlers/auth_handler.go`

Handler untuk authentication endpoints:

- `Login()` - Handle POST /api/v1/auth/login
- `Register()` - Handle POST /api/v1/auth/register

#### `/internal/utils/jwt.go`

JWT utilities:

- `GenerateJWT()` - Generate JWT token
- `ValidateJWT()` - Validate JWT token
- `JWTClaims` struct - JWT payload structure

### 2. **File yang Di-update**

#### `/backend/.env`

Tambahan config:

```env
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRATION_HOURS=24
```

#### `/internal/config/config.go`

Tambahan fields di Config struct:

```go
JWTSecret          string
JWTExpirationHours int
```

#### `/internal/repository/pengguna_repository.go`

Tambahan methods:

- `GetByEmailWithPassword()` - Get user dengan password hash (untuk login)
- `UpdateLastLogin()` - Update timestamp terakhir login

#### `/backend/go.mod`

Tambahan dependency:

```go
github.com/golang-jwt/jwt/v5 v5.2.1
```

#### `/cmd/api/main.go`

- Initialize AuthHandler
- Tambah auth routes

---

## 📡 New API Endpoints

### 1. Register (Sign Up)

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**

```json
{
  "nama_depan": "Jane",
  "nama_belakang": "Smith",
  "email": "jane@example.com",
  "kata_sandi": "password123",
  "peran": "Developer"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwZW5nZ3VuYV9pZCI6MiwiZW1haWwiOiJqYW5lQGV4YW1wbGUuY29tIiwicGVyYW4iOiJEZXZlbG9wZXIiLCJleHAiOjE3MzQ1MzI4MDAsImlhdCI6MTczNDQ0NjQwMCwiaXNzIjoicGotdGFzay1tYW5hZ2VyIn0.xxx",
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

**Error Response (409 Conflict - Email sudah terdaftar):**

```json
{
  "success": false,
  "message": "Email sudah terdaftar",
  "error": ""
}
```

**Features:**

- ✅ Hash password dengan bcrypt
- ✅ Validasi email unique (cek duplikasi)
- ✅ Auto-generate JWT token setelah register
- ✅ Return user data + token untuk auto-login

---

### 2. Login

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**

```json
{
  "email": "jane@example.com",
  "kata_sandi": "password123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx",
    "user": {
      "pengguna_id": 2,
      "nama_depan": "Jane",
      "nama_belakang": "Smith",
      "email": "jane@example.com",
      "peran": "Developer",
      "is_aktif": true,
      "dibuat_pada": "2025-10-18T10:00:00Z",
      "terakhir_login": "2025-10-18T14:30:00Z"
    },
    "message": "Login berhasil"
  }
}
```

**Error Response (401 Unauthorized - Email/Password salah):**

```json
{
  "success": false,
  "message": "Email atau password salah",
  "error": ""
}
```

**Error Response (403 Forbidden - Akun tidak aktif):**

```json
{
  "success": false,
  "message": "Akun tidak aktif",
  "error": ""
}
```

**Features:**

- ✅ Validasi email & password dengan bcrypt
- ✅ Cek status aktif user
- ✅ Generate JWT token
- ✅ Update terakhir_login timestamp
- ✅ Return user data + token

---

## 🔑 JWT Token Structure

### Claims (Payload):

```json
{
  "pengguna_id": 2,
  "email": "jane@example.com",
  "peran": "Developer",
  "exp": 1734532800, // Expiration timestamp
  "iat": 1734446400, // Issued at timestamp
  "iss": "pj-task-manager" // Issuer
}
```

### Token Format:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.PAYLOAD.SIGNATURE
```

**Default Expiration:** 24 jam (configurable via JWT_EXPIRATION_HOURS)

---

## 🧪 Testing

### Register User

```bash
curl -X POST http://localhost:5599/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nama_depan": "Test",
    "nama_belakang": "User",
    "email": "test@example.com",
    "kata_sandi": "password123",
    "peran": "Karyawan"
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

### Save Token

```bash
# Extract token dari response
TOKEN=$(curl -X POST http://localhost:5599/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","kata_sandi":"password123"}' \
  | jq -r '.data.token')

echo $TOKEN
```

### Use Token (Future - untuk protected routes)

```bash
curl -X GET http://localhost:5599/api/v1/pengguna \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔒 Security Features

### 1. **Password Hashing**

- Menggunakan `bcrypt` dengan default cost (10)
- Password tidak pernah disimpan dalam plain text
- Password hash tidak pernah dikirim ke frontend (field `kata_sandi_hash` di-exclude dari JSON)

### 2. **JWT Token**

- Signed dengan HS256 (HMAC-SHA256)
- Secret key dari environment variable
- Expiration time configurable
- Claims include: user_id, email, role

### 3. **Email Validation**

- Email harus unique (cek saat register)
- Format email validated dengan binding tag `email`

### 4. **Account Status Check**

- Login hanya untuk user dengan `is_aktif = true`
- Soft-deleted users tidak bisa login

---

## 📖 Penjelasan Alur untuk Pemula

### Register Flow:

```
1. Client → POST /api/v1/auth/register
2. AuthHandler.Register()
   ↓
3. Validasi input (nama, email, password)
4. Cek email sudah terdaftar? (query database)
   - Jika sudah → Return 409 Conflict
   - Jika belum → lanjut
   ↓
5. Hash password dengan bcrypt
6. Insert ke database (repository.Create)
7. Generate JWT token
8. Return user data + token
```

### Login Flow:

```
1. Client → POST /api/v1/auth/login
2. AuthHandler.Login()
   ↓
3. Validasi input (email, password)
4. Cari user by email (repository.GetByEmailWithPassword)
   - Jika tidak ada → Return 401 Unauthorized
   - Jika ada → lanjut
   ↓
5. Cek is_aktif = true?
   - Jika false → Return 403 Forbidden
   - Jika true → lanjut
   ↓
6. Compare password hash dengan bcrypt
   - Jika tidak match → Return 401 Unauthorized
   - Jika match → lanjut
   ↓
7. Generate JWT token
8. Update terakhir_login timestamp
9. Return user data + token
```

---

## 🎯 Total Endpoints Sekarang

**Before:** 27 endpoints  
**After:** **29 endpoints**

- Health Check: 1
- **Authentication: 2** ← NEW!
- Users: 5
- Projects: 7
- Tasks: 10
- Comments: 4

---

## 🔜 Next Steps (Optional)

### Future Enhancements:

- [ ] **Auth Middleware** - Protect routes yang butuh authentication
- [ ] **JWT Refresh Token** - Untuk extend session tanpa re-login
- [ ] **Role-based Access Control (RBAC)** - Restrict actions by user role
- [ ] **Password Reset** - Forgot password flow
- [ ] **Email Verification** - Verify email setelah register
- [ ] **OAuth Integration** - Google, GitHub login

---

## 📝 Environment Variables

Pastikan file `.env` sudah di-update:

```env
PORT=5599

PG_DB_HOST=localhost
PG_DB_PORT=5432
PG_DB_USER=postgres
PG_DB_PASSWORD=123456
PG_DB_NAME=pm

# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRATION_HOURS=24
```

**⚠️ PENTING untuk Production:**

- Ganti `JWT_SECRET` dengan random string yang kuat
- Jangan commit `.env` ke git (sudah ada di .gitignore)

---

## ✅ Checklist Testing

- [ ] Register user baru - berhasil
- [ ] Register dengan email yang sama - error 409
- [ ] Login dengan email/password benar - berhasil
- [ ] Login dengan password salah - error 401
- [ ] Login dengan email tidak terdaftar - error 401
- [ ] Login dengan user tidak aktif - error 403
- [ ] Token di-generate dan valid

---

**Update Date:** October 18, 2025  
**Feature:** JWT Authentication (Login & Register)  
**Status:** ✅ Complete & Ready to Use
