import api from "../lib/axios";
import type {
  LoginInput,
  RegisterInput,
  AuthResponse,
  ApiResponse,
} from "../types";

export const authApi = {
  // Login
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      data
    );
    return response.data.data;
  },

  // Register
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      data
    );
    return response.data.data;
  },
};
