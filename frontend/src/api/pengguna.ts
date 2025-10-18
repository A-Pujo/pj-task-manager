import api from "../lib/axios";
import type {
  Pengguna,
  CreatePenggunaInput,
  UpdatePenggunaInput,
  ApiResponse,
} from "../types";

export const penggunaApi = {
  // Get all users
  getAll: async (): Promise<Pengguna[]> => {
    const response = await api.get<ApiResponse<{ pengguna: Pengguna[] }>>(
      "/pengguna"
    );
    return response.data.data.pengguna;
  },

  // Get user by ID
  getById: async (id: number): Promise<Pengguna> => {
    const response = await api.get<ApiResponse<{ pengguna: Pengguna }>>(
      `/pengguna/${id}`
    );
    return response.data.data.pengguna;
  },

  // Create user
  create: async (data: CreatePenggunaInput): Promise<Pengguna> => {
    const response = await api.post<ApiResponse<{ pengguna: Pengguna }>>(
      "/pengguna",
      data
    );
    return response.data.data.pengguna;
  },

  // Update user
  update: async (id: number, data: UpdatePenggunaInput): Promise<Pengguna> => {
    const response = await api.put<ApiResponse<{ pengguna: Pengguna }>>(
      `/pengguna/${id}`,
      data
    );
    return response.data.data.pengguna;
  },

  // Delete user
  delete: async (id: number): Promise<void> => {
    await api.delete(`/pengguna/${id}`);
  },
};
