import api from "../lib/axios";
import type {
  Proyek,
  CreateProyekInput,
  UpdateProyekInput,
  ApiResponse,
} from "../types";

export const proyekApi = {
  // Get all projects
  getAll: async (): Promise<Proyek[]> => {
    const response = await api.get<ApiResponse<{ proyek: Proyek[] }>>(
      "/proyek"
    );
    return response.data.data.proyek;
  },

  // Get project by ID
  getById: async (id: number): Promise<Proyek> => {
    const response = await api.get<ApiResponse<Proyek>>(`/proyek/${id}`);
    return response.data.data;
  },

  // Create project
  create: async (data: CreateProyekInput): Promise<Proyek> => {
    const response = await api.post<ApiResponse<Proyek>>("/proyek", data);
    return response.data.data;
  },

  // Update project
  update: async (id: number, data: UpdateProyekInput): Promise<Proyek> => {
    const response = await api.put<ApiResponse<Proyek>>(`/proyek/${id}`, data);
    return response.data.data;
  },

  // Delete project
  delete: async (id: number): Promise<void> => {
    await api.delete(`/proyek/${id}`);
  },
};
