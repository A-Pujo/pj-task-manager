"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit2,
  Plus,
  Trash2,
  User,
  Calendar,
  Clock,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { proyekApi } from "@/api/proyek";
import { tugasApi } from "@/api/tugas";
import { penugasanApi } from "@/api/penugasan";
import { komentarApi } from "@/api/komentar";
import { penggunaApi } from "@/api/pengguna";
import toast from "react-hot-toast";
import type {
  Proyek,
  Tugas,
  KomentarWithUser,
  Pengguna,
  CreateTugasInput,
  UpdateProyekInput,
} from "@/types";

export default function ProyekDetailPage() {
  const router = useRouter();
  const params = useParams();
  const proyekId = Number(params.id);

  const [proyek, setProyek] = useState<Proyek | null>(null);
  const [tugas, setTugas] = useState<Tugas[]>([]);
  const [komentar, setKomentar] = useState<KomentarWithUser[]>([]);
  const [pengguna, setPengguna] = useState<Pengguna[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit states
  const [isEditingProyek, setIsEditingProyek] = useState(false);
  const [editedProyek, setEditedProyek] = useState<UpdateProyekInput>({
    nama_proyek: "",
    deskripsi: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    status: "",
  });

  // Add task modal
  const [isAddingTugas, setIsAddingTugas] = useState(false);
  const [newTugas, setNewTugas] = useState<CreateTugasInput>({
    proyek_id: proyekId,
    nama_tugas: "",
    deskripsi: "",
    status: "Pending",
    prioritas: "Sedang",
    tanggal_deadline: "",
  });
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Activity log accordion
  const [isLogOpen, setIsLogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [proyekId]);

  const fetchData = async () => {
    if (!proyekId || isNaN(proyekId)) return;
    try {
      setLoading(true);
      const [proyekData, tugasData, komentarData, penggunaData] =
        await Promise.all([
          proyekApi.getById(proyekId),
          tugasApi.getByProyekId(proyekId),
          komentarApi.getByProyekId(proyekId),
          penggunaApi.getAll(),
        ]);

      setProyek(proyekData);
      setTugas(tugasData);
      setKomentar(komentarData);
      setPengguna(penggunaData);

      setEditedProyek({
        nama_proyek: proyekData?.nama_proyek,
        deskripsi: proyekData?.deskripsi || "",
        tanggal_mulai: proyekData?.tanggal_mulai
          ? proyekData.tanggal_mulai.split("T")[0]
          : "",
        tanggal_selesai: proyekData?.tanggal_selesai
          ? proyekData.tanggal_selesai.split("T")[0]
          : "",
        status: proyekData?.status || "",
      });
    } catch (error: any) {
      console.error("Error fetching project data:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Gagal memuat data proyek";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProyek = async () => {
    if (!editedProyek.nama_proyek) {
      toast.error("Nama proyek harus diisi");
      return;
    }

    try {
      await proyekApi.update(proyekId, editedProyek);
      toast.success("Proyek berhasil diperbarui");
      setIsEditingProyek(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Gagal memperbarui proyek");
    }
  };

  const handleAddTugas = async () => {
    if (!newTugas.nama_tugas) {
      toast.error("Judul tugas harus diisi");
      return;
    }

    try {
      const createdTugas = await tugasApi.create(newTugas);

      // Assign selected users
      if (selectedUsers.length > 0) {
        await penugasanApi.assignMultipleUsers(
          createdTugas.tugas_id,
          selectedUsers
        );
      }

      toast.success("Tugas berhasil ditambahkan");
      setIsAddingTugas(false);
      setNewTugas({
        proyek_id: proyekId,
        nama_tugas: "",
        deskripsi: "",
        status: "Pending",
        prioritas: "Sedang",
        tanggal_deadline: "",
      });
      setSelectedUsers([]);
      setSelectAll(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Gagal menambahkan tugas");
    }
  };

  const handleDeleteTugas = async (tugasId: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tugas ini?")) return;

    try {
      await tugasApi.delete(tugasId);
      toast.success("Tugas berhasil dihapus");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Gagal menghapus tugas");
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(pengguna.map((p) => p.pengguna_id));
    }
    setSelectAll(!selectAll);
  };

  useEffect(() => {
    if (pengguna.length > 0 && selectedUsers.length === pengguna.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedUsers, pengguna]);

  const getStatusColor = (status: string) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!proyek) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Proyek tidak ditemukan</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard/proyek")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Daftar Proyek
          </button>
        </div>

        {/* Project Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {proyek.nama_proyek}
            </h1>
            <button
              onClick={() => setIsEditingProyek(!isEditingProyek)}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              {isEditingProyek ? "Batal" : "Edit Proyek"}
            </button>
          </div>

          {isEditingProyek ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Proyek
                </label>
                <input
                  type="text"
                  value={editedProyek.nama_proyek}
                  onChange={(e) =>
                    setEditedProyek({
                      ...editedProyek,
                      nama_proyek: e.target.value,
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
                  value={editedProyek.deskripsi}
                  onChange={(e) =>
                    setEditedProyek({
                      ...editedProyek,
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
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={editedProyek.tanggal_mulai}
                    onChange={(e) =>
                      setEditedProyek({
                        ...editedProyek,
                        tanggal_mulai: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={editedProyek.tanggal_selesai}
                    onChange={(e) =>
                      setEditedProyek({
                        ...editedProyek,
                        tanggal_selesai: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Proyek
                </label>
                <select
                  value={editedProyek.status}
                  onChange={(e) =>
                    setEditedProyek({
                      ...editedProyek,
                      status: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="aktif">Aktif</option>
                  <option value="pending">Pending</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdateProyek}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Simpan Perubahan
                </button>
                <button
                  onClick={() => setIsEditingProyek(false)}
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
                  {proyek.deskripsi || "Tidak ada deskripsi"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    Mulai:{" "}
                    {proyek.tanggal_mulai
                      ? new Date(proyek.tanggal_mulai).toLocaleDateString(
                          "id-ID"
                        )
                      : "-"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    Selesai:{" "}
                    {proyek.tanggal_selesai
                      ? new Date(proyek.tanggal_selesai).toLocaleDateString(
                          "id-ID"
                        )
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tasks Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Daftar Tugas</h2>
            <button
              onClick={() => setIsAddingTugas(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Tugas
            </button>
          </div>

          {tugas?.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Belum ada tugas. Tambahkan tugas pertama Anda!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Judul Tugas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prioritas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tugas?.map((t) => (
                    <tr
                      key={t.tugas_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {t.nama_tugas}
                        </div>
                        {t.deskripsi && (
                          <div className="text-sm text-gray-500">
                            {t.deskripsi}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            t.status
                          )}`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getPrioritasColor(
                            t.prioritas
                          )}`}
                        >
                          {t.prioritas}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {t.tanggal_deadline
                          ? new Date(t.tanggal_deadline).toLocaleDateString(
                              "id-ID"
                            )
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() =>
                            router.push(`/dashboard/tugas/${t.tugas_id}`)
                          }
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Lihat
                        </button>
                        <button
                          onClick={() => handleDeleteTugas(t.tugas_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Activity Log Accordion */}
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
            <div className="border-t border-gray-200 p-6">
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
                        <div className="flex items-center gap-2 mb-1">
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

      {/* Add Task Modal */}
      {isAddingTugas && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Tambah Tugas Baru
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Tugas *
                </label>
                <input
                  type="text"
                  value={newTugas.nama_tugas}
                  onChange={(e) =>
                    setNewTugas({ ...newTugas, nama_tugas: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan judul tugas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={newTugas.deskripsi}
                  onChange={(e) =>
                    setNewTugas({ ...newTugas, deskripsi: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan deskripsi tugas"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newTugas.status}
                    onChange={(e) =>
                      setNewTugas({
                        ...newTugas,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioritas
                  </label>
                  <select
                    value={newTugas.prioritas}
                    onChange={(e) =>
                      setNewTugas({
                        ...newTugas,
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
                  value={newTugas.tanggal_deadline}
                  onChange={(e) =>
                    setNewTugas({
                      ...newTugas,
                      tanggal_deadline: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Assign ke Pengguna
                  </label>
                  <button
                    onClick={toggleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {selectAll ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                  {pengguna.map((p) => (
                    <label
                      key={p.pengguna_id}
                      className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-50 px-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(p.pengguna_id)}
                        onChange={() => toggleUserSelection(p.pengguna_id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {p.nama_depan} {p.nama_belakang} ({p.email})
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedUsers.length} pengguna dipilih
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleAddTugas}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tambah Tugas
              </button>
              <button
                onClick={() => {
                  setIsAddingTugas(false);
                  setNewTugas({
                    proyek_id: proyekId,
                    nama_tugas: "",
                    deskripsi: "",
                    status: "Pending",
                    prioritas: "Sedang",
                    tanggal_deadline: "",
                  });
                  setSelectedUsers([]);
                  setSelectAll(false);
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
