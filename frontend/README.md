# Task Manager - Frontend

Aplikasi manajemen proyek dan tugas berbasis Next.js dengan desain elegan dan minimalis.

## 🚀 Tech Stack

- **Framework:** Next.js 15.5.6 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast
- **Date Utilities:** date-fns

## 📋 Prerequisites

- Node.js 18+ atau Bun
- pnpm (disarankan) / npm / yarn
- Backend API berjalan di port 5599

## 🛠️ Installation

1. Install dependencies:
```bash
pnpm install
```

2. Copy file `.env` dan sesuaikan konfigurasi:
```env
PORT=5577
API_URL=http://localhost:5577/api/v1
NEXT_PUBLIC_API_URL=http://localhost:5599/api/v1
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION_HOURS=6
```

3. Jalankan development server:
```bash
pnpm dev
```

4. Buka browser: `http://localhost:5577`

## 📁 Struktur Folder

```
frontend/
├── src/
│   ├── api/              # API client functions
│   │   ├── auth.ts       # Auth endpoints
│   │   ├── pengguna.ts   # User endpoints
│   │   ├── proyek.ts     # Project endpoints
│   │   ├── tugas.ts      # Task endpoints
│   │   └── komentar.ts   # Comment endpoints
│   ├── app/              # Next.js App Router
│   │   ├── auth/         # Auth pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/    # Dashboard pages
│   │   │   ├── pengguna/
│   │   │   ├── proyek/
│   │   │   ├── tugas/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/       # React components
│   │   ├── dashboard/
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/              # Utilities
│   │   └── axios.ts      # Axios instance
│   └── types/            # TypeScript types
│       └── index.ts
├── .env                  # Environment variables
├── next.config.ts        # Next.js config
├── tailwind.config.ts    # Tailwind config
└── tsconfig.json         # TypeScript config
```

## 🎨 Features

### Authentication
- ✅ Login dengan email & password
- ✅ Register pengguna baru
- ✅ JWT Token authentication
- ✅ Auto redirect untuk protected routes
- ✅ Logout functionality

### Dashboard
- ✅ Dashboard home dengan statistik
- ✅ Recent projects & tasks
- ✅ Responsive sidebar navigation
- ✅ User profile header

### Pengguna Management
- ✅ CRUD Pengguna
- ✅ Table view dengan pagination
- ✅ Modal untuk create/edit
- ✅ Role management (Admin/Member)
- ✅ User status tracking

### Proyek Management
- ✅ CRUD Proyek
- ✅ Card-based layout
- ✅ Status indicators (Aktif, Pending, Selesai)
- ✅ Project owner assignment
- ✅ Date range tracking

### Tugas Management
- ✅ CRUD Tugas
- ✅ Priority levels (Rendah, Sedang, Tinggi, Urgent)
- ✅ Status tracking (Pending, Dalam Proses, Selesai, Ditunda)
- ✅ Deadline management
- ✅ Project association

## 🎯 API Integration

Frontend berkomunikasi dengan backend melalui REST API:

**Base URL:** `http://localhost:5599/api/v1`

### Available Endpoints

**Auth:**
- POST `/auth/login` - Login
- POST `/auth/register` - Register

**Pengguna:**
- GET `/pengguna` - Get all users
- GET `/pengguna/:id` - Get user by ID
- POST `/pengguna` - Create user
- PUT `/pengguna/:id` - Update user
- DELETE `/pengguna/:id` - Delete user

**Proyek:**
- GET `/proyek` - Get all projects
- GET `/proyek/:id` - Get project by ID
- POST `/proyek` - Create project
- PUT `/proyek/:id` - Update project
- DELETE `/proyek/:id` - Delete project

**Tugas:**
- GET `/tugas` - Get all tasks
- GET `/tugas/:id` - Get task by ID
- GET `/proyek/:id/tugas` - Get tasks by project
- POST `/tugas` - Create task
- PUT `/tugas/:id` - Update task
- DELETE `/tugas/:id` - Delete task
- POST `/tugas/:id/assign` - Assign user to task
- DELETE `/tugas/:id/assign/:userId` - Unassign user

**Komentar:**
- GET `/komentar` - Get all comments
- GET `/proyek/:id/komentar` - Get comments by project
- GET `/tugas/:id/komentar` - Get comments by task
- POST `/komentar` - Create comment
- DELETE `/komentar/:id` - Delete comment

## 🔐 Authentication Flow

1. User login/register via form
2. Backend returns JWT token + user data
3. Token disimpan di `localStorage`
4. Axios interceptor menambahkan token ke semua request
5. Token expired → Auto logout & redirect ke login

## 🎨 Design System

### Colors
- **Primary:** Blue (#2563EB)
- **Secondary:** Purple (#9333EA)
- **Success:** Green (#10B981)
- **Warning:** Orange (#F59E0B)
- **Error:** Red (#EF4444)

### Typography
- **Font:** Geist Sans (Variable)
- **Monospace:** Geist Mono

### Components
- Rounded corners: `rounded-xl`, `rounded-2xl`
- Shadows: `shadow-lg`, `shadow-xl`
- Transitions: `transition-all`, `transition-colors`

## 📱 Responsive Design

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

Sidebar collapsible untuk mobile/tablet view.

## 🚀 Build & Deploy

### Development
```bash
pnpm dev
```

### Production Build
```bash
pnpm build
pnpm start
```

### Lint Check
```bash
pnpm lint
```

## �� Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Frontend port | 5577 |
| `API_URL` | Server-side API URL | http://localhost:5577/api/v1 |
| `NEXT_PUBLIC_API_URL` | Client-side API URL | http://localhost:5599/api/v1 |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRATION_HOURS` | Token expiration | 6 |

## 📄 License

MIT License - see LICENSE file

## 👨‍💻 Development

Dibuat dengan ❤️ menggunakan:
- Next.js 15.5.6
- React 19.1.0
- TypeScript 5
- Tailwind CSS v4

---

**Note:** Pastikan backend server berjalan di port 5599 sebelum menjalankan frontend.
