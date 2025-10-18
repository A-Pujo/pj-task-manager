import api from "../lib/axios";
import type { Komentar, CreateKomentarInput, ApiResponse } from "../types";

export const komentarApi = {
  // Get all comments
  getAll: async (): Promise<Komentar[]> => {
    const response = await api.get<ApiResponse<{ komentar: Komentar[] }>>(
      "/komentar"
    );
    return response.data.data.komentar;
  },

  // Get comments by project ID
  getByProyekId: async (proyekId: number): Promise<Komentar[]> => {
    const response = await api.get<ApiResponse<{ komentar: Komentar[] }>>(
      `/proyek/${proyekId}/komentar`
    );
    return response.data.data.komentar;
  },

  // Get comments by task ID
  getByTugasId: async (tugasId: number): Promise<Komentar[]> => {
    const response = await api.get<ApiResponse<{ komentar: Komentar[] }>>(
      `/tugas/${tugasId}/komentar`
    );
    return response.data.data.komentar;
  },

  // Create comment
  create: async (data: CreateKomentarInput): Promise<Komentar> => {
    const response = await api.post<ApiResponse<{ komentar: Komentar }>>(
      "/komentar",
      data
    );
    return response.data.data.komentar;
  },

  // Delete comment
  delete: async (id: number): Promise<void> => {
    await api.delete(`/komentar/${id}`);
  },
};
