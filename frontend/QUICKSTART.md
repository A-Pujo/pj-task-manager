# Quick Start Guide - Task Manager Frontend

Panduan cepat untuk menjalankan aplikasi Task Manager Frontend.

## 🚀 Quick Setup (5 Menit)

### 1. Install Dependencies
```bash
cd frontend
pnpm install
```

### 2. Setup Environment
File `.env` sudah tersedia dengan konfigurasi default:
```env
PORT=5577
NEXT_PUBLIC_API_URL=http://localhost:5599/api/v1
```

### 3. Jalankan Development Server
```bash
pnpm dev
```

Frontend akan berjalan di: **http://localhost:5577**

## 📱 Cara Menggunakan

### 1. Register Akun Baru
1. Buka http://localhost:5577
2. Klik "Daftar Sekarang"
3. Isi form registrasi:
   - Nama Depan & Belakang
   - Email
   - Password (min 6 karakter)
   - Pilih role (Admin/Member)
4. Klik "Daftar Sekarang"

### 2. Login
1. Masukkan email dan password
2. Klik "Masuk"
3. Otomatis redirect ke Dashboard

### 3. Dashboard
Halaman utama menampilkan:
- **Statistik:** Total Proyek, Tugas, Pengguna, Tugas Pending
- **Proyek Terbaru:** 5 proyek terakhir
- **Tugas Terbaru:** 5 tugas terakhir

### 4. Kelola Pengguna
1. Klik menu "Pengguna" di sidebar
2. **Tambah:** Klik tombol "+ Tambah Pengguna"
3. **Edit:** Klik icon pensil pada baris pengguna
4. **Hapus:** Klik icon tempat sampah

### 5. Kelola Proyek
1. Klik menu "Proyek" di sidebar
2. **Tambah:** Klik "+ Tambah Proyek"
3. Isi form:
   - Nama Proyek
   - Deskripsi
   - Tanggal Mulai & Selesai
   - Status (Aktif/Pending/Selesai)
   - Pemilik Proyek
4. **Edit/Hapus:** Klik tombol pada card proyek

### 6. Kelola Tugas
1. Klik menu "Tugas" di sidebar
2. **Tambah:** Klik "+ Tambah Tugas"
3. Isi form:
   - Pilih Proyek
   - Nama Tugas
   - Deskripsi
   - Prioritas (Rendah/Sedang/Tinggi/Urgent)
   - Status (Pending/Dalam Proses/Selesai/Ditunda)
   - Tanggal Mulai & Deadline
4. **Edit/Hapus:** Klik tombol pada card tugas

## 🎨 Fitur UI

### Sidebar
- **Collapsible:** Klik icon chevron untuk collapse/expand
- **Active State:** Menu aktif ditandai dengan background biru
- **Icons:** Setiap menu memiliki icon dari Lucide React

### Header
- **Search:** Cari proyek atau tugas (coming soon)
- **Notifications:** Bell icon dengan badge notifikasi
- **User Menu:** Nama pengguna, role, dan tombol logout

### Modal Forms
- **Overlay:** Background gelap semi-transparan
- **Validation:** Form validation built-in
- **Responsive:** Menyesuaikan ukuran layar

## 🔑 Credential Test

Jika sudah ada data di database:
```
Email: admin@example.com
Password: password123
```

## ⚡ Hot Tips

1. **Auto Redirect:** Landing page otomatis redirect ke login/dashboard
2. **Protected Routes:** Akses dashboard butuh login
3. **Auto Logout:** Token expired otomatis logout
4. **Real-time Toast:** Notifikasi untuk setiap aksi (success/error)
5. **Loading States:** Spinner saat fetch data

## 🛠️ Troubleshooting

### Port 5577 sudah digunakan
```bash
# Ganti port di package.json
"dev": "next dev -p 3000"
```

### Backend tidak berjalan
```bash
# Pastikan backend berjalan di port 5599
cd ../backend
go run cmd/api/main.go
```

### CORS Error
Pastikan backend sudah enable CORS untuk `http://localhost:5577`

### Token Expired
Logout dan login kembali untuk refresh token

## 📦 Build Production

```bash
# Build
pnpm build

# Start production server
pnpm start
```

## 🎯 Next Steps

1. ✅ Explore semua fitur CRUD
2. ✅ Test dengan berbagai role (Admin/Member)
3. ✅ Coba semua status dan prioritas
4. ✅ Test responsiveness di mobile/tablet
5. ✅ Customize design sesuai kebutuhan

---

**Happy Coding! ��**
