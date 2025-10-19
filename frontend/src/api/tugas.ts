import api from "../lib/axios";
import type {
  Tugas,
  CreateTugasInput,
  UpdateTugasInput,
  AssignUserInput,
  ApiResponse,
} from "../types";

export const tugasApi = {
  // Get all tasks
  getAll: async (): Promise<Tugas[]> => {
    const response = await api.get<ApiResponse<{ tugas: Tugas[] }>>("/tugas");
    return response.data.data.tugas;
  },

  // Get task by ID
  getById: async (id: number): Promise<Tugas> => {
    const response = await api.get<ApiResponse<any>>(`/tugas/${id}`);
    // Backend returns TugasWithAssignees, extract just the Tugas part
    return response.data.data;
  },

  // Get tasks by project ID
  getByProyekId: async (proyekId: number): Promise<Tugas[]> => {
    const response = await api.get<ApiResponse<{ tugas: Tugas[] }>>(
      `/proyek/${proyekId}/tugas`
    );
    return response.data.data.tugas;
  },

  // Create task
  create: async (data: CreateTugasInput): Promise<Tugas> => {
    const response = await api.post<ApiResponse<Tugas>>("/tugas", data);
    return response.data.data;
  },

  // Update task
  update: async (id: number, data: UpdateTugasInput): Promise<Tugas> => {
    const response = await api.put<ApiResponse<Tugas>>(`/tugas/${id}`, data);
    return response.data.data;
  },

  // Delete task
  delete: async (id: number): Promise<void> => {
    await api.delete(`/tugas/${id}`);
  },

  // Assign user to task
  assignUser: async (tugasId: number, data: AssignUserInput): Promise<void> => {
    await api.post(`/tugas/${tugasId}/assign`, data);
  },

  // Unassign user from task
  unassignUser: async (tugasId: number, userId: number): Promise<void> => {
    await api.delete(`/tugas/${tugasId}/assign/${userId}`);
  },
};
