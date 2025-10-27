"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit2,
  Save,
  X,
  Trash2,
  User,
  Calendar,
  Clock,
  Target,
  FileText,
  AlertCircle,
} from "lucide-react";
import { subtugasApi } from "@/api/subtugas";
import { tugasApi } from "@/api/tugas";
import { proyekApi } from "@/api/proyek";
import { penggunaApi } from "@/api/pengguna";
import toast from "react-hot-toast";
import type {
  Subtugas,
  Tugas,
  Proyek,
  Pengguna,
  UpdateSubtugasInput,
} from "@/types";

export default function SubtugasDetailPage() {
  const router = useRouter();
  const params = useParams();
  const subtugasId = Number(params.id);

  const [subtugas, setSubtugas] = useState<Subtugas | null>(null);
  const [tugas, setTugas] = useState<Tugas | null>(null);
  const [proyek, setProyek] = useState<Proyek | null>(null);
  const [allUsers, setAllUsers] = useState<Pengguna[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubtugas, setEditedSubtugas] = useState<UpdateSubtugasInput>({
    nama_subtugas: "",
    deskripsi: "",
    status: "Belum Dimulai",
    prioritas: "Medium",
    tanggal_mulai: "",
    tanggal_deadline: "",
    pengguna_id: undefined,
    persentase_selesai: 0,
  });

  useEffect(() => {
    fetchData();
  }, [subtugasId]);

  const fetchData = async () => {
    if (!subtugasId || isNaN(subtugasId)) {
      console.error("Invalid subtugas ID:", subtugasId);
      toast.error("ID tidak valid");
      router.push("/dashboard/tugas");
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching subtugas with ID:", subtugasId);
      const subtugasData = await subtugasApi.getById(subtugasId);
      console.log("Subtugas data:", subtugasData);
      setSubtugas(subtugasData);

      if (!subtugasData.tugas_id) {
        throw new Error("Tugas ID tidak ditemukan dalam data subtugas");
      }

      const [tugasData, allUsersData] = await Promise.all([
        tugasApi.getById(subtugasData.tugas_id),
        penggunaApi.getAll(),
      ]);

      setTugas(tugasData);
      setAllUsers(allUsersData);

      const proyekData = await proyekApi.getById(tugasData.proyek_id);
      setProyek(proyekData);

      // Set edit form data
      setEditedSubtugas({
        nama_subtugas: subtugasData.nama_subtugas,
        deskripsi: subtugasData.deskripsi || "",
        status: subtugasData.status,
        prioritas: subtugasData.prioritas,
        tanggal_mulai: subtugasData.tanggal_mulai
          ? subtugasData.tanggal_mulai.split("T")[0]
          : "",
        tanggal_deadline: subtugasData.tanggal_deadline
          ? subtugasData.tanggal_deadline.split("T")[0]
          : "",
        pengguna_id: subtugasData.pengguna_id || undefined,
        persentase_selesai: subtugasData.persentase_selesai || 0,
      });
    } catch (error: any) {
      console.error("Error fetching subtugas data:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Gagal memuat data subtugas";
      toast.error(errorMessage);
      router.push("/dashboard/tugas");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubtugas = async () => {
    if (!editedSubtugas.nama_subtugas) {
      toast.error("Nama subtugas harus diisi");
      return;
    }

    try {
      await subtugasApi.update(subtugasId, editedSubtugas);
      toast.success("Subtugas berhasil diperbarui");
      setIsEditing(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Gagal memperbarui subtugas");
    }
  };

  const handleDeleteSubtugas = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus subtugas ini?")) return;

    try {
      await subtugasApi.delete(subtugasId);
      toast.success("Subtugas berhasil dihapus");
      router.push(`/dashboard/tugas/${tugas?.tugas_id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Gagal menghapus subtugas");
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
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!subtugas || !tugas || !proyek) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Subtugas tidak ditemukan</div>
      </div>
    );
  }

  const isOverdue =
    subtugas.tanggal_deadline &&
    new Date(subtugas.tanggal_deadline) < new Date() &&
    subtugas.status !== "Selesai";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.push(`/dashboard/tugas/${tugas.tugas_id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Detail Tugas
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isEditing
                  ? "text-gray-600 bg-gray-100 hover:bg-gray-200"
                  : "text-blue-600 bg-blue-50 hover:bg-blue-100"
              }`}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4" />
                  Batal
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  Edit Subtugas
                </>
              )}
            </button>
            <button
              onClick={handleDeleteSubtugas}
              className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Hapus
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Subtugas Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Breadcrumb Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="space-y-2">
                <div className="text-sm text-gray-500">Proyek</div>
                <div className="text-lg font-semibold text-gray-900">
                  {proyek.nama_proyek}
                </div>
                <div className="text-sm text-gray-500">Tugas</div>
                <div className="text-base font-medium text-gray-800">
                  {tugas.nama_tugas}
                </div>
              </div>
            </div>

            {/* Subtugas Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {subtugas.nama_subtugas}
                  </h1>
                  {isOverdue && (
                    <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                      <AlertCircle className="w-4 h-4" />
                      Terlambat
                    </div>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Subtugas
                    </label>
                    <input
                      type="text"
                      value={editedSubtugas.nama_subtugas}
                      onChange={(e) =>
                        setEditedSubtugas({
                          ...editedSubtugas,
                          nama_subtugas: e.target.value,
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
                      value={editedSubtugas.deskripsi}
                      onChange={(e) =>
                        setEditedSubtugas({
                          ...editedSubtugas,
                          deskripsi: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Deskripsi subtugas..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={editedSubtugas.status}
                        onChange={(e) =>
                          setEditedSubtugas({
                            ...editedSubtugas,
                            status: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Belum Dimulai">Belum Dimulai</option>
                        <option value="Dalam Proses">Dalam Proses</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Ditunda">Ditunda</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prioritas
                      </label>
                      <select
                        value={editedSubtugas.prioritas}
                        onChange={(e) =>
                          setEditedSubtugas({
                            ...editedSubtugas,
                            prioritas: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Progress (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editedSubtugas.persentase_selesai}
                      onChange={(e) =>
                        setEditedSubtugas({
                          ...editedSubtugas,
                          persentase_selesai: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned To
                    </label>
                    <select
                      value={editedSubtugas.pengguna_id?.toString() || ""}
                      onChange={(e) =>
                        setEditedSubtugas({
                          ...editedSubtugas,
                          pengguna_id: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Tidak ada</option>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tanggal Mulai
                      </label>
                      <input
                        type="date"
                        value={editedSubtugas.tanggal_mulai}
                        onChange={(e) =>
                          setEditedSubtugas({
                            ...editedSubtugas,
                            tanggal_mulai: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tanggal Deadline
                      </label>
                      <input
                        type="date"
                        value={editedSubtugas.tanggal_deadline}
                        onChange={(e) =>
                          setEditedSubtugas({
                            ...editedSubtugas,
                            tanggal_deadline: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleUpdateSubtugas}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Simpan Perubahan
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium">Deskripsi</span>
                    </div>
                    <div className="text-gray-800 bg-gray-50 rounded-lg p-4">
                      {subtugas.deskripsi || "Tidak ada deskripsi"}
                    </div>
                  </div>

                  {/* Status & Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Target className="w-4 h-4" />
                        <span className="font-medium">Status</span>
                      </div>
                      <span
                        className={`inline-flex px-3 py-1 text-sm font-medium rounded-md border ${getStatusColor(
                          subtugas.status
                        )}`}
                      >
                        {subtugas.status}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-medium">Prioritas</span>
                      </div>
                      <span
                        className={`inline-flex px-3 py-1 text-sm font-medium rounded-md border ${getPriorityColor(
                          subtugas.prioritas
                        )}`}
                      >
                        {subtugas.prioritas}
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Target className="w-4 h-4" />
                      <span className="font-medium">Progress</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Kemajuan</span>
                        <span className="font-medium text-lg">
                          {subtugas.persentase_selesai}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{
                            width: `${subtugas.persentase_selesai}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">Tanggal Mulai</span>
                      </div>
                      <div className="text-gray-800">
                        {formatDate(subtugas.tanggal_mulai)}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">Deadline</span>
                      </div>
                      <div
                        className={`font-medium ${
                          isOverdue ? "text-red-600" : "text-gray-800"
                        }`}
                      >
                        {formatDate(subtugas.tanggal_deadline)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Additional Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Informasi Tambahan
              </h3>

              <div className="space-y-4">
                {/* Assigned User */}
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Ditugaskan kepada
                    </span>
                  </div>
                  <div className="text-gray-800 font-medium">
                    {getUserName(subtugas.pengguna_id)}
                  </div>
                </div>

                {/* Created/Modified dates if available */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>ID Subtugas: {subtugas.subtugas_id}</div>
                    <div>ID Tugas: {subtugas.tugas_id}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
