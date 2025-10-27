"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit2,
  User,
  Calendar,
  Clock,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Trash2,
  Eye,
} from "lucide-react";
import { tugasApi } from "@/api/tugas";
import { proyekApi } from "@/api/proyek";
import { komentarApi } from "@/api/komentar";
import { penggunaApi } from "@/api/pengguna";
import { penugasanApi } from "@/api/penugasan";
import { subtugasApi } from "@/api/subtugas";
import toast from "react-hot-toast";
import type {
  Tugas,
  Proyek,
  KomentarWithUser,
  Pengguna,
  UpdateTugasInput,
  CreateKomentarInput,
  Subtugas,
  CreateSubtugasInput,
  UpdateSubtugasInput,
} from "@/types";

export default function TugasDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tugasId = Number(params.id);

  const [tugas, setTugas] = useState<Tugas | null>(null);
  const [proyek, setProyek] = useState<Proyek | null>(null);
  const [komentar, setKomentar] = useState<KomentarWithUser[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<Pengguna[]>([]);
  const [allUsers, setAllUsers] = useState<Pengguna[]>([]);
  const [subtugas, setSubtugas] = useState<Subtugas[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit states
  const [isEditingTugas, setIsEditingTugas] = useState(false);
  const [editedTugas, setEditedTugas] = useState<UpdateTugasInput>({
    nama_tugas: "",
    deskripsi: "",
    status: "Pending",
    prioritas: "Sedang",
    tanggal_deadline: "",
  });

  // Assign user modal
  const [isAssigningUser, setIsAssigningUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number>(0);

  // Activity log accordion & comment form
  const [isLogOpen, setIsLogOpen] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number>(0);

  // Subtugas states
  const [showSubtugasForm, setShowSubtugasForm] = useState(false);
  const [subtugasFormData, setSubtugasFormData] = useState<CreateSubtugasInput>(
    {
      tugas_id: tugasId,
      nama_subtugas: "",
      deskripsi: "",
      status: "Belum Dimulai",
      prioritas: "Medium",
      tanggal_mulai: "",
      tanggal_deadline: "",
      pengguna_id: undefined,
      persentase_selesai: 0,
    }
  );

  useEffect(() => {
    // Get current user from localStorage
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setCurrentUserId(parsedUser.pengguna_id);
      } catch (error) {
        console.error("Failed to parse user:", error);
      }
    }

    fetchData();
  }, [tugasId]);

  const fetchData = async () => {
    if (!tugasId || isNaN(tugasId)) return;
    try {
      setLoading(true);
      const tugasData = await tugasApi.getById(tugasId);
      setTugas(tugasData);

      const [
        proyekData,
        komentarData,
        assignedDataResponse,
        allUsersData,
        subtugasData,
      ] = await Promise.all([
        proyekApi.getById(tugasData.proyek_id),
        komentarApi.getByTugasId(tugasId),
        penugasanApi.getAssignedUsers(tugasId),
        penggunaApi.getAll(),
        subtugasApi.getByTugasId(tugasId),
      ]);

      // Fetch subtugas separately with error handling
      setProyek(proyekData);
      setKomentar(komentarData);
      setAssignedUsers(assignedDataResponse.users);
      setAllUsers(allUsersData);
      console.log("Subtugas data received:", subtugasData);
      setSubtugas(subtugasData);

      // Set form data tugas ID
      setSubtugasFormData((prev) => ({
        ...prev,
        tugas_id: tugasData.tugas_id,
      }));

      setEditedTugas({
        nama_tugas: tugasData.nama_tugas,
        deskripsi: tugasData.deskripsi || "",
        status: tugasData.status as any,
        prioritas: tugasData.prioritas as any,
        tanggal_deadline: tugasData.tanggal_deadline
          ? tugasData.tanggal_deadline.split("T")[0]
          : "",
      });
    } catch (error: any) {
      console.error("Error fetching task data:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Gagal memuat data tugas";
      toast.error(errorMessage);
      router.push("/dashboard/tugas");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTugas = async () => {
    if (!editedTugas.nama_tugas) {
      toast.error("Nama tugas harus diisi");
      return;
    }

    try {
      await tugasApi.update(tugasId, editedTugas);
      toast.success("Tugas berhasil diperbarui");
      setIsEditingTugas(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Gagal memperbarui tugas");
    }
  };

  const handleAssignUser = async () => {
    if (!selectedUserId) {
      toast.error("Pilih pengguna untuk ditugaskan");
      return;
    }

    // Check if user already assigned
    if (assignedUsers?.some((u) => u.pengguna_id === selectedUserId)) {
      toast.error("Pengguna sudah ditugaskan");
      return;
    }

    try {
      await penugasanApi.assignUser(tugasId, selectedUserId);
      toast.success("Pengguna berhasil ditugaskan");
      setIsAssigningUser(false);
      setSelectedUserId(0);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Gagal menugaskan pengguna");
    }
  };

  const handleUnassignUser = async (userId: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus penugasan ini?")) return;

    try {
      await penugasanApi.unassignUser(tugasId, userId);
      toast.success("Penugasan berhasil dihapus");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Gagal menghapus penugasan");
    }
  };

  // Subtugas handlers
  const handleCreateSubtugas = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subtugasFormData.nama_subtugas.trim()) {
      toast.error("Nama subtugas harus diisi!");
      return;
    }

    try {
      await subtugasApi.create(subtugasFormData);
      toast.success("Subtugas berhasil dibuat");

      // Reset form
      setSubtugasFormData({
        tugas_id: tugasId,
        nama_subtugas: "",
        deskripsi: "",
        status: "Belum Dimulai",
        prioritas: "Medium",
        tanggal_mulai: "",
        tanggal_deadline: "",
        pengguna_id: undefined,
        persentase_selesai: 0,
      });

      setShowSubtugasForm(false);
      fetchData();
    } catch (error: any) {
      console.error("Error creating subtask:", error);
      toast.error(error.response?.data?.message || "Gagal membuat subtugas");
    }
  };

  const getPriorityColor = (prioritas: string) => {
    switch (prioritas) {
      case "Critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Selesai":
        return "bg-green-100 text-green-800 border-green-200";
      case "Dalam Proses":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Ditunda":
        return "bg-red-100 text-red-800 border-red-200";
      case "Belum Dimulai":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getUserName = (penggunaId?: number) => {
    if (!penggunaId) return "Tidak ada";
    const user = allUsers.find((u) => u.pengguna_id === penggunaId);
    return user ? `${user.nama_depan} ${user.nama_belakang}` : "Unknown";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("Komentar tidak boleh kosong");
      return;
    }

    if (!currentUserId) {
      toast.error("User ID tidak ditemukan");
      return;
    }

    try {
      const commentData: CreateKomentarInput = {
        pengguna_id: currentUserId,
        proyek_id: proyek?.proyek_id || undefined,
        tugas_id: tugasId,
        komentar: newComment.trim(),
      };

      await komentarApi.create(commentData);
      toast.success("Komentar berhasil ditambahkan");
      setNewComment("");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Gagal menambahkan komentar");
    }
  };

  const handleDeleteComment = async (komentarId: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus komentar ini?")) return;

    try {
      await komentarApi.delete(komentarId);
      toast.success("Komentar berhasil dihapus");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Gagal menghapus komentar");
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "Selesai":
        return "text-green-600 bg-green-50";
      case "Sedang Dikerjakan":
        return "text-blue-600 bg-blue-50";
      case "Pending":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getPrioritasColor = (prioritas: string) => {
    switch (prioritas) {
      case "Tinggi":
        return "text-red-600 bg-red-50";
      case "Sedang":
        return "text-yellow-600 bg-yellow-50";
      case "Rendah":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // Filter unassigned users
  const unassignedUsers = allUsers.filter(
    (user) => !assignedUsers?.some((au) => au.pengguna_id === user.pengguna_id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!tugas || !proyek) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Tugas tidak ditemukan</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.push(`/dashboard/proyek/${proyek.proyek_id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Detail Proyek
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Task Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Proyek</h3>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {proyek.nama_proyek}
              </h2>
              {proyek.deskripsi && (
                <p className="text-gray-600 text-sm">{proyek.deskripsi}</p>
              )}
            </div>

            {/* Task Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  {tugas.nama_tugas}
                </h1>
                <button
                  onClick={() => setIsEditingTugas(!isEditingTugas)}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  {isEditingTugas ? "Batal" : "Edit Tugas"}
                </button>
              </div>

              {isEditingTugas ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Tugas
                    </label>
                    <input
                      type="text"
                      value={editedTugas.nama_tugas}
                      onChange={(e) =>
                        setEditedTugas({
                          ...editedTugas,
                          nama_tugas: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi
                    </label>
                    <textarea
                      value={editedTugas.deskripsi}
                      onChange={(e) =>
                        setEditedTugas({
                          ...editedTugas,
                          deskripsi: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={editedTugas.status}
                        onChange={(e) =>
                          setEditedTugas({
                            ...editedTugas,
                            status: e.target.value as any,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Sedang Dikerjakan">
                          Sedang Dikerjakan
                        </option>
                        <option value="Selesai">Selesai</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prioritas
                      </label>
                      <select
                        value={editedTugas.prioritas}
                        onChange={(e) =>
                          setEditedTugas({
                            ...editedTugas,
                            prioritas: e.target.value as any,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Rendah">Rendah</option>
                        <option value="Sedang">Sedang</option>
                        <option value="Tinggi">Tinggi</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={editedTugas.tanggal_deadline}
                      onChange={(e) =>
                        setEditedTugas({
                          ...editedTugas,
                          tanggal_deadline: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleUpdateTugas}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Simpan Perubahan
                    </button>
                    <button
                      onClick={() => setIsEditingTugas(false)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Deskripsi
                    </h3>
                    <p className="text-gray-900">
                      {tugas.deskripsi || "Tidak ada deskripsi"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Status
                      </h3>
                      <span
                        className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                          tugas.status
                        )}`}
                      >
                        {tugas.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Prioritas
                      </h3>
                      <span
                        className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getPrioritasColor(
                          tugas.prioritas
                        )}`}
                      >
                        {tugas.prioritas}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      Deadline:{" "}
                      {tugas.tanggal_deadline
                        ? new Date(tugas.tanggal_deadline).toLocaleDateString(
                            "id-ID"
                          )
                        : "Tidak ada deadline"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Subtugas Section */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Subtugas ({subtugas?.length || 0})
                </h2>
                <button
                  onClick={() => setShowSubtugasForm(!showSubtugasForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {showSubtugasForm ? "Batal" : "Tambah Subtugas"}
                </button>
              </div>

              {/* Form Tambah Subtugas */}
              {showSubtugasForm && (
                <div className="border-b border-gray-200 p-6">
                  <form onSubmit={handleCreateSubtugas} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Subtugas *
                      </label>
                      <input
                        type="text"
                        value={subtugasFormData.nama_subtugas}
                        onChange={(e) =>
                          setSubtugasFormData((prev) => ({
                            ...prev,
                            nama_subtugas: e.target.value,
                          }))
                        }
                        placeholder="Masukkan nama subtugas"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deskripsi
                      </label>
                      <textarea
                        value={subtugasFormData.deskripsi}
                        onChange={(e) =>
                          setSubtugasFormData((prev) => ({
                            ...prev,
                            deskripsi: e.target.value,
                          }))
                        }
                        placeholder="Deskripsi subtugas (opsional)"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={subtugasFormData.status}
                          onChange={(e) =>
                            setSubtugasFormData((prev) => ({
                              ...prev,
                              status: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Belum Dimulai">Belum Dimulai</option>
                          <option value="Dalam Proses">Dalam Proses</option>
                          <option value="Selesai">Selesai</option>
                          <option value="Ditunda">Ditunda</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prioritas
                        </label>
                        <select
                          value={subtugasFormData.prioritas}
                          onChange={(e) =>
                            setSubtugasFormData((prev) => ({
                              ...prev,
                              prioritas: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Assign ke User
                        </label>
                        <select
                          value={subtugasFormData.pengguna_id?.toString() || ""}
                          onChange={(e) =>
                            setSubtugasFormData((prev) => ({
                              ...prev,
                              pengguna_id: e.target.value
                                ? parseInt(e.target.value)
                                : undefined,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Pilih user (opsional)</option>
                          {allUsers.map((user) => (
                            <option
                              key={user.pengguna_id}
                              value={user.pengguna_id.toString()}
                            >
                              {user.nama_depan} {user.nama_belakang}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tanggal Mulai
                        </label>
                        <input
                          type="date"
                          value={subtugasFormData.tanggal_mulai}
                          onChange={(e) =>
                            setSubtugasFormData((prev) => ({
                              ...prev,
                              tanggal_mulai: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tanggal Deadline
                        </label>
                        <input
                          type="date"
                          value={subtugasFormData.tanggal_deadline}
                          onChange={(e) =>
                            setSubtugasFormData((prev) => ({
                              ...prev,
                              tanggal_deadline: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setShowSubtugasForm(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={
                          loading || !subtugasFormData.nama_subtugas.trim()
                        }
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Menyimpan..." : "Tambah Subtugas"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Daftar Subtugas */}
              <div className="p-6">
                {!subtugas || subtugas.length === 0 ? (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Belum ada subtugas
                    </h3>
                    <p className="text-gray-500">
                      Tambah subtugas untuk mengelola pekerjaan detail.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nama Subtugas
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status & Prioritas
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Progress
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Assigned To
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Timeline
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {subtugas.map((item) => (
                          <React.Fragment key={item.subtugas_id}>
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="max-w-xs">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {item.nama_subtugas}
                                  </div>
                                  {item.deskripsi && (
                                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                      {item.deskripsi}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="space-y-1">
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${getStatusColor(
                                      item.status
                                    )}`}
                                  >
                                    {item.status}
                                  </span>
                                  <br />
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${getPriorityColor(
                                      item.prioritas
                                    )}`}
                                  >
                                    {item.prioritas}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-full max-w-[120px]">
                                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                    <span>Progress</span>
                                    <span className="font-medium">
                                      {item.persentase_selesai}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                      style={{
                                        width: `${item.persentase_selesai}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {getUserName(item.pengguna_id)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-xs text-gray-600 space-y-1">
                                  <div>
                                    <span className="font-medium">Mulai:</span>
                                    <br />
                                    <span>
                                      {formatDate(item.tanggal_mulai)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      Deadline:
                                    </span>
                                    <br />
                                    <span
                                      className={
                                        item.tanggal_deadline &&
                                        new Date(item.tanggal_deadline) <
                                          new Date() &&
                                        item.status !== "Selesai"
                                          ? "text-red-600 font-medium"
                                          : ""
                                      }
                                    >
                                      {formatDate(item.tanggal_deadline)}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => {
                                    console.log("Clicked subtugas item:", item);
                                    console.log(
                                      "Subtugas ID:",
                                      item?.subtugas_id
                                    );
                                    if (item?.subtugas_id) {
                                      router.push(
                                        `/dashboard/subtugas/${item.subtugas_id}`
                                      );
                                    } else {
                                      toast.error("ID subtugas tidak valid");
                                    }
                                  }}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  Lihat Detail
                                </button>
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Log */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <button
                onClick={() => setIsLogOpen(!isLogOpen)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Log Aktivitas ({komentar?.length})
                  </h2>
                </div>
                {isLogOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {isLogOpen && (
                <div className="border-t border-gray-200 p-6 space-y-6">
                  {/* Add Comment Form */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tambah Komentar
                    </label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tulis komentar atau update..."
                    />
                    <button
                      onClick={handleAddComment}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Kirim Komentar
                    </button>
                  </div>

                  {/* Comments List */}
                  {komentar?.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                      Belum ada log aktivitas
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {komentar?.map((k) => (
                        <div
                          key={k.komentar_id}
                          className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">
                                  {k.pengguna
                                    ? `${k.pengguna.nama_depan} ${k.pengguna.nama_belakang}`
                                    : "Unknown"}
                                </span>
                                <span className="text-sm text-gray-500">•</span>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Clock className="w-3 h-3" />
                                  {new Date(k.dibuat_pada).toLocaleDateString(
                                    "id-ID",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </div>
                              </div>
                              {currentUserId === k.pengguna_id && (
                                <button
                                  onClick={() =>
                                    handleDeleteComment(k.komentar_id)
                                  }
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <p className="text-gray-700">{k.komentar}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Assigned Users */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Pengguna Ditugaskan
                </h2>
                {unassignedUsers?.length > 0 && (
                  <button
                    onClick={() => setIsAssigningUser(true)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                )}
              </div>

              {assignedUsers?.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm">
                  Belum ada pengguna yang ditugaskan
                </p>
              ) : (
                <div className="space-y-3">
                  {assignedUsers?.map((user) => (
                    <div
                      key={user.pengguna_id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {user.nama_depan} {user.nama_belakang}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnassignUser(user.pengguna_id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assign User Modal */}
      {isAssigningUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Tugaskan Pengguna
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Pengguna
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>-- Pilih Pengguna --</option>
                  {unassignedUsers.map((user) => (
                    <option key={user.pengguna_id} value={user.pengguna_id}>
                      {user.nama_depan} {user.nama_belakang} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleAssignUser}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tugaskan
              </button>
              <button
                onClick={() => {
                  setIsAssigningUser(false);
                  setSelectedUserId(0);
                }}
                className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
