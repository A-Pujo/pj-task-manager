import api from "@/lib/axios";
import type {
  Subtugas,
  CreateSubtugasInput,
  UpdateSubtugasInput,
  ApiResponse,
} from "@/types";

export const subtugasApi = {
  // Get all subtasks
  getAll: async (): Promise<Subtugas[]> => {
    const response = await api.get<ApiResponse<{ subtugas: Subtugas[] }>>(
      "/subtugas"
    );
    return response.data.data.subtugas;
  },

  // Get subtasks by task ID
  getByTugasId: async (tugasId: number): Promise<Subtugas[]> => {
    const response = await api.get<ApiResponse<{ subtugas: Subtugas[] }>>(
      `/tugas/${tugasId}/subtugas`
    );
    return response.data.data.subtugas;
  },

  // Get subtask by ID
  getById: async (id: number): Promise<Subtugas> => {
    const response = await api.get<ApiResponse<any>>(`/subtugas/${id}`);
    // Handle different response formats from backend
    const data = response.data.data;
    return data.subtugas || data;
  },

  // Create subtask
  create: async (data: CreateSubtugasInput): Promise<Subtugas> => {
    const response = await api.post<ApiResponse<Subtugas>>("/subtugas", data);
    return response.data.data;
  },

  // Update subtask
  update: async (id: number, data: UpdateSubtugasInput): Promise<Subtugas> => {
    const response = await api.put<ApiResponse<Subtugas>>(
      `/subtugas/${id}`,
      data
    );
    return response.data.data;
  },

  // Delete subtask
  delete: async (id: number): Promise<void> => {
    await api.delete(`/subtugas/${id}`);
  },
};
