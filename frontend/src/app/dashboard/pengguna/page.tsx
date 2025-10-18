"use client";

import { useEffect, useState } from "react";
import { penggunaApi } from "@/api/pengguna";
import type {
  Pengguna,
  CreatePenggunaInput,
  UpdatePenggunaInput,
} from "@/types";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function PenggunaPage() {
  const [penggunaList, setPenggunaList] = useState<Pengguna[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreatePenggunaInput>({
    nama_depan: "",
    nama_belakang: "",
    email: "",
    kata_sandi: "",
    peran: "member",
  });

  useEffect(() => {
    fetchPengguna();
  }, []);

  const fetchPengguna = async () => {
    try {
      const data = await penggunaApi.getAll();
      setPenggunaList(data);
    } catch (error) {
      toast.error("Gagal mengambil data pengguna");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updateData: UpdatePenggunaInput = { ...formData };
        if (!updateData.kata_sandi) delete updateData.kata_sandi;
        await penggunaApi.update(editingId, updateData);
        toast.success("Pengguna berhasil diperbarui");
      } else {
        await penggunaApi.create(formData);
        toast.success("Pengguna berhasil ditambahkan");
      }
      setShowModal(false);
      resetForm();
      fetchPengguna();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan");
    }
  };

  const handleEdit = (pengguna: Pengguna) => {
    setEditingId(pengguna.pengguna_id);
    setFormData({
      nama_depan: pengguna.nama_depan,
      nama_belakang: pengguna.nama_belakang,
      email: pengguna.email,
      kata_sandi: "",
      peran: pengguna.peran,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus pengguna ini?")) return;
    try {
      await penggunaApi.delete(id);
      toast.success("Pengguna berhasil dihapus");
      fetchPengguna();
    } catch (error) {
      toast.error("Gagal menghapus pengguna");
    }
  };

  const resetForm = () => {
    setFormData({
      nama_depan: "",
      nama_belakang: "",
      email: "",
      kata_sandi: "",
      peran: "member",
    });
    setEditingId(null);
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
          <h1 className="text-2xl font-bold text-gray-900">Pengguna</h1>
          <p className="text-gray-600 mt-1">Kelola pengguna sistem</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Pengguna
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Nama
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Peran
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Terakhir Login
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {penggunaList.map((pengguna) => (
                <tr key={pengguna.pengguna_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-medium">
                        {pengguna.nama_depan[0]}
                        {pengguna.nama_belakang[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {pengguna.nama_depan} {pengguna.nama_belakang}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {pengguna.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      {pengguna.peran}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        pengguna.is_aktif
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {pengguna.is_aktif ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {pengguna.terakhir_login
                      ? format(
                          new Date(pengguna.terakhir_login),
                          "dd MMM yyyy HH:mm",
                          {
                            locale: id,
                          }
                        )
                      : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(pengguna)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pengguna.pengguna_id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? "Edit Pengguna" : "Tambah Pengguna"}
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
                  Nama Depan
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_depan}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_depan: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Belakang
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_belakang}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_belakang: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kata Sandi{" "}
                  {editingId && "(kosongkan jika tidak ingin mengubah)"}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  value={formData.kata_sandi}
                  onChange={(e) =>
                    setFormData({ ...formData, kata_sandi: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peran
                </label>
                <select
                  value={formData.peran}
                  onChange={(e) =>
                    setFormData({ ...formData, peran: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
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
