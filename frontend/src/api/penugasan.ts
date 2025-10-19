import api from "../lib/axios";
import { Pengguna, Tugas, ApiResponse } from "../types";

// Get assigned users for a task
export const penugasanApi = {
  getAssignedUsers: async (tugasId: number) => {
    const response = await api.get<
      ApiResponse<{ users: Pengguna[]; total: number }>
    >(`/tugas/${tugasId}/assigned`);
    return response.data.data;
  },

  assignUser: async (tugasId: number, userId: number) => {
    const response = await api.post<ApiResponse<any>>(
      `/tugas/${tugasId}/assign/${userId}`
    );
    return response.data.data;
  },

  unassignUser: async (tugasId: number, userId: number) => {
    const response = await api.delete<ApiResponse<any>>(
      `/tugas/${tugasId}/assign/${userId}`
    );
    return response.data.data;
  },

  assignMultipleUsers: async (tugasId: number, penggunaIds: number[]) => {
    const response = await api.post<ApiResponse<any>>(
      `/tugas/${tugasId}/assign-multiple`,
      {
        pengguna_ids: penggunaIds,
      }
    );
    return response.data.data;
  },

  getUserTasks: async (userId: number) => {
    const response = await api.get<
      ApiResponse<{ tugas: Tugas[]; total: number }>
    >(`/pengguna/${userId}/tugas`);
    return response.data.data;
  },
};
