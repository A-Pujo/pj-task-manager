// ==================== PENGGUNA (User) ====================
export interface Pengguna {
  pengguna_id: number;
  nama_depan: string;
  nama_belakang: string;
  email: string;
  peran: string;
  is_aktif: boolean;
  terakhir_login?: string;
  dibuat_pada: string;
  diperbarui_pada?: string;
}

export interface CreatePenggunaInput {
  nama_depan: string;
  nama_belakang: string;
  email: string;
  kata_sandi: string;
  peran: string;
}

export interface UpdatePenggunaInput {
  nama_depan?: string;
  nama_belakang?: string;
  email?: string;
  kata_sandi?: string;
  peran?: string;
  is_aktif?: boolean;
}

// ==================== PROYEK (Project) ====================
export interface Proyek {
  proyek_id: number;
  nama_proyek: string;
  deskripsi?: string;
  tanggal_mulai: string;
  tanggal_selesai?: string;
  status: string;
  pengguna_id: number;
  dibuat_pada: string;
  diperbarui_pada?: string;
}

export interface CreateProyekInput {
  nama_proyek: string;
  deskripsi?: string;
  tanggal_mulai: string;
  tanggal_selesai?: string;
  status: string;
  pengguna_id: number;
}

export interface UpdateProyekInput {
  nama_proyek?: string;
  deskripsi?: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  status?: string;
  pengguna_id?: number;
}

// ==================== TUGAS (Task) ====================
export interface Tugas {
  tugas_id: number;
  proyek_id: number;
  nama_tugas: string;
  deskripsi?: string;
  prioritas: string;
  status: string;
  tanggal_mulai?: string;
  tanggal_deadline?: string;
  dibuat_pada: string;
  diperbarui_pada?: string;
}

export interface CreateTugasInput {
  proyek_id: number;
  nama_tugas: string;
  deskripsi?: string;
  prioritas: string;
  status: string;
  tanggal_mulai?: string;
  tanggal_deadline?: string;
}

export interface UpdateTugasInput {
  proyek_id?: number;
  nama_tugas?: string;
  deskripsi?: string;
  prioritas?: string;
  status?: string;
  tanggal_mulai?: string;
  tanggal_deadline?: string;
}

export interface AssignUserInput {
  user_id: number;
}

// ==================== PENUGASAN TUGAS (Task Assignment) ====================
export interface PenugasanTugas {
  penugasan_id: number;
  tugas_id: number;
  pengguna_id: number;
  ditugaskan_pada: string;
}

// ==================== KOMENTAR (Comment) ====================
export interface Komentar {
  komentar_id: number;
  pengguna_id: number;
  proyek_id?: number;
  tugas_id?: number;
  komentar: string;
  dibuat_pada: string;
}

export interface KomentarWithUser extends Komentar {
  pengguna: Pengguna;
}

export interface CreateKomentarInput {
  pengguna_id: number;
  proyek_id?: number;
  tugas_id?: number;
  komentar: string;
}

// ==================== AUTH ====================
export interface LoginInput {
  email: string;
  kata_sandi: string;
}

export interface RegisterInput {
  nama_depan: string;
  nama_belakang: string;
  email: string;
  kata_sandi: string;
  peran: string;
}

export interface AuthResponse {
  token: string;
  user: Pengguna;
  message: string;
}

// ==================== API RESPONSE ====================
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
