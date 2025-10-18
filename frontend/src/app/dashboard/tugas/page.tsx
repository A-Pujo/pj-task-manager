"use client";

import { useEffect, useState } from "react";
import { tugasApi } from "@/api/tugas";
import { proyekApi } from "@/api/proyek";
import type {
  Tugas,
  CreateTugasInput,
  UpdateTugasInput,
  Proyek,
} from "@/types";
import { Plus, Edit2, Trash2, X, Calendar, Flag } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function TugasPage() {
  const [tugasList, setTugasList] = useState<Tugas[]>([]);
  const [proyekList, setProyekList] = useState<Proyek[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateTugasInput>({
    proyek_id: 0,
    nama_tugas: "",
    deskripsi: "",
    prioritas: "sedang",
    status: "pending",
    tanggal_mulai: "",
    tanggal_deadline: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tugass, proyeks] = await Promise.all([
        tugasApi.getAll(),
        proyekApi.getAll(),
      ]);
      if (tugass) setTugasList(tugass);
      if (proyeks) setProyekList(proyeks);
    } catch (error) {
      toast.error("Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await tugasApi.update(editingId, formData);
        toast.success("Tugas berhasil diperbarui");
      } else {
        await tugasApi.create(formData);
        toast.success("Tugas berhasil ditambahkan");
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan");
    }
  };

  const handleEdit = (tugas: Tugas) => {
    setEditingId(tugas.tugas_id);
    setFormData({
      proyek_id: tugas.proyek_id,
      nama_tugas: tugas.nama_tugas,
      deskripsi: tugas.deskripsi || "",
      prioritas: tugas.prioritas,
      status: tugas.status,
      tanggal_mulai: tugas.tanggal_mulai?.split("T")[0] || "",
      tanggal_deadline: tugas.tanggal_deadline?.split("T")[0] || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus tugas ini?")) return;
    try {
      await tugasApi.delete(id);
      toast.success("Tugas berhasil dihapus");
      fetchData();
    } catch (error) {
      toast.error("Gagal menghapus tugas");
    }
  };

  const resetForm = () => {
    setFormData({
      proyek_id: 0,
      nama_tugas: "",
      deskripsi: "",
      prioritas: "sedang",
      status: "pending",
      tanggal_mulai: "",
      tanggal_deadline: "",
    });
    setEditingId(null);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      dalam_proses: "bg-blue-100 text-blue-700",
      selesai: "bg-green-100 text-green-700",
      ditunda: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      rendah: "bg-gray-100 text-gray-700",
      sedang: "bg-blue-100 text-blue-700",
      tinggi: "bg-orange-100 text-orange-700",
      urgent: "bg-red-100 text-red-700",
    };
    return colors[priority] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tugas</h1>
          <p className="text-gray-600 mt-1">Kelola semua tugas Anda</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Tugas
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tugasList.map((tugas) => {
          const proyek = proyekList.find(
            (p) => p.proyek_id === tugas.proyek_id
          );
          return (
            <div
              key={tugas.tugas_id}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-lg flex-1">
                  {tugas.nama_tugas}
                </h3>
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(
                    tugas.prioritas
                  )}`}
                >
                  <Flag className="w-3 h-3 inline mr-1" />
                  {tugas.prioritas}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {tugas.deskripsi || "Tidak ada deskripsi"}
              </p>

              <div className="space-y-2 mb-4">
                {proyek && (
                  <div className="text-sm text-gray-500">
                    Proyek:{" "}
                    <span className="font-medium text-gray-700">
                      {proyek.nama_proyek}
                    </span>
                  </div>
                )}
                {tugas.tanggal_deadline && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Deadline:{" "}
                      {format(new Date(tugas.tanggal_deadline), "dd MMM yyyy", {
                        locale: id,
                      })}
                    </span>
                  </div>
                )}
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      tugas.status
                    )}`}
                  >
                    {tugas.status}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(tugas)}
                  className="flex-1 px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(tugas.tugas_id)}
                  className="flex-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                >
                  Hapus
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? "Edit Tugas" : "Tambah Tugas"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proyek
                </label>
                <select
                  required
                  value={formData.proyek_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      proyek_id: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="">Pilih Proyek</option>
                  {proyekList.map((proyek) => (
                    <option key={proyek.proyek_id} value={proyek.proyek_id}>
                      {proyek.nama_proyek}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Tugas
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_tugas}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_tugas: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  rows={3}
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioritas
                  </label>
                  <select
                    value={formData.prioritas}
                    onChange={(e) =>
                      setFormData({ ...formData, prioritas: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  >
                    <option value="rendah">Rendah</option>
                    <option value="sedang">Sedang</option>
                    <option value="tinggi">Tinggi</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="dalam_proses">Dalam Proses</option>
                    <option value="selesai">Selesai</option>
                    <option value="ditunda">Ditunda</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={formData.tanggal_mulai}
                  onChange={(e) =>
                    setFormData({ ...formData, tanggal_mulai: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={formData.tanggal_deadline}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tanggal_deadline: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  {editingId ? "Perbarui" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
