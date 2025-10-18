"use client";

import { useEffect, useState } from "react";
import { proyekApi } from "@/api/proyek";
import { penggunaApi } from "@/api/pengguna";
import type {
  Proyek,
  CreateProyekInput,
  UpdateProyekInput,
  Pengguna,
} from "@/types";
import { Plus, Edit2, Trash2, X, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function ProyekPage() {
  const [proyekList, setProyekList] = useState<Proyek[]>([]);
  const [penggunaList, setPenggunaList] = useState<Pengguna[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateProyekInput>({
    nama_proyek: "",
    deskripsi: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    status: "aktif",
    pengguna_id: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [proyeks, penggunas] = await Promise.all([
        proyekApi.getAll(),
        penggunaApi.getAll(),
      ]);
      if (proyeks) setProyekList(proyeks);
      if (penggunas) setPenggunaList(penggunas);
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
        await proyekApi.update(editingId, formData);
        toast.success("Proyek berhasil diperbarui");
      } else {
        await proyekApi.create(formData);
        toast.success("Proyek berhasil ditambahkan");
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan");
    }
  };

  const handleEdit = (proyek: Proyek) => {
    setEditingId(proyek.proyek_id);
    setFormData({
      nama_proyek: proyek.nama_proyek,
      deskripsi: proyek.deskripsi || "",
      tanggal_mulai: proyek.tanggal_mulai.split("T")[0],
      tanggal_selesai: proyek.tanggal_selesai?.split("T")[0] || "",
      status: proyek.status,
      pengguna_id: proyek.pengguna_id,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus proyek ini?")) return;
    try {
      await proyekApi.delete(id);
      toast.success("Proyek berhasil dihapus");
      fetchData();
    } catch (error) {
      toast.error("Gagal menghapus proyek");
    }
  };

  const resetForm = () => {
    setFormData({
      nama_proyek: "",
      deskripsi: "",
      tanggal_mulai: "",
      tanggal_selesai: "",
      status: "aktif",
      pengguna_id: 0,
    });
    setEditingId(null);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      aktif: "bg-green-100 text-green-700",
      selesai: "bg-blue-100 text-blue-700",
      pending: "bg-yellow-100 text-yellow-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
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
          <h1 className="text-2xl font-bold text-gray-900">Proyek</h1>
          <p className="text-gray-600 mt-1">Kelola semua proyek Anda</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Proyek
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proyekList.map((proyek) => {
          const owner = penggunaList.find(
            (p) => p.pengguna_id === proyek.pengguna_id
          );
          return (
            <div
              key={proyek.proyek_id}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {proyek.nama_proyek}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    proyek.status
                  )}`}
                >
                  {proyek.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {proyek.deskripsi || "Tidak ada deskripsi"}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(proyek.tanggal_mulai), "dd MMM yyyy", {
                      locale: id,
                    })}
                    {proyek.tanggal_selesai &&
                      ` - ${format(
                        new Date(proyek.tanggal_selesai),
                        "dd MMM yyyy",
                        { locale: id }
                      )}`}
                  </span>
                </div>
                {owner && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-medium">
                      {owner.nama_depan[0]}
                      {owner.nama_belakang[0]}
                    </div>
                    <span>
                      {owner.nama_depan} {owner.nama_belakang}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(proyek)}
                  className="flex-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(proyek.proyek_id)}
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
                {editingId ? "Edit Proyek" : "Tambah Proyek"}
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
                  Nama Proyek
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_proyek}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_proyek: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  required
                  value={formData.tanggal_mulai}
                  onChange={(e) =>
                    setFormData({ ...formData, tanggal_mulai: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  value={formData.tanggal_selesai}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tanggal_selesai: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
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
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="aktif">Aktif</option>
                  <option value="pending">Pending</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pemilik Proyek
                </label>
                <select
                  required
                  value={formData.pengguna_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pengguna_id: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Pilih Pengguna</option>
                  {penggunaList.map((pengguna) => (
                    <option
                      key={pengguna.pengguna_id}
                      value={pengguna.pengguna_id}
                    >
                      {pengguna.nama_depan} {pengguna.nama_belakang}
                    </option>
                  ))}
                </select>
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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
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
