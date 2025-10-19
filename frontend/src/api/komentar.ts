import api from "../lib/axios";
import type {
  KomentarWithUser,
  CreateKomentarInput,
  ApiResponse,
} from "../types";

export const komentarApi = {
  // Get all comments
  getAll: async (): Promise<KomentarWithUser[]> => {
    const response = await api.get<
      ApiResponse<{ komentar: KomentarWithUser[] }>
    >("/komentar");
    return response.data.data.komentar;
  },

  // Get comments by project ID
  getByProyekId: async (proyekId: number): Promise<KomentarWithUser[]> => {
    const response = await api.get<
      ApiResponse<{ komentar: KomentarWithUser[] }>
    >(`/proyek/${proyekId}/komentar`);
    return response.data.data.komentar;
  },

  // Get comments by task ID
  getByTugasId: async (tugasId: number): Promise<KomentarWithUser[]> => {
    const response = await api.get<
      ApiResponse<{ komentar: KomentarWithUser[] }>
    >(`/tugas/${tugasId}/komentar`);
    return response.data.data.komentar;
  },

  // Create comment
  create: async (data: CreateKomentarInput): Promise<KomentarWithUser> => {
    const response = await api.post<ApiResponse<KomentarWithUser>>(
      "/komentar",
      data
    );
    return response.data.data;
  },

  // Delete comment
  delete: async (id: number): Promise<void> => {
    await api.delete(`/komentar/${id}`);
  },
};
