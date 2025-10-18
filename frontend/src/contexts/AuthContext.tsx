"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/api/auth";
import type { Pengguna, LoginInput, RegisterInput } from "@/types";
import toast from "react-hot-toast";

interface AuthContextType {
  user: Pengguna | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Pengguna | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user dari localStorage saat pertama kali
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (data: LoginInput) => {
    try {
      const response = await authApi.login(data);

      // Simpan token dan user
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      setToken(response.token);
      setUser(response.user);

      toast.success("Login berhasil!");
      router.push("/dashboard");
    } catch (error: any) {
      const message = error.response?.data?.message || "Login gagal";
      toast.error(message);
      throw error;
    }
  };

  const register = async (data: RegisterInput) => {
    try {
      const response = await authApi.register(data);

      // Simpan token dan user
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      setToken(response.token);
      setUser(response.user);

      toast.success("Registrasi berhasil!");
      router.push("/dashboard");
    } catch (error: any) {
      const message = error.response?.data?.message || "Registrasi gagal";
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    toast.success("Logout berhasil");
    router.push("/auth/login");
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
