"use client";

import { useEffect, useState } from "react";
import { proyekApi } from "@/api/proyek";
import { tugasApi } from "@/api/tugas";
import { penggunaApi } from "@/api/pengguna";
import { FolderKanban, CheckSquare, Users, Clock } from "lucide-react";
import type { Proyek, Tugas, Pengguna } from "@/types";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProyek: 0,
    totalTugas: 0,
    totalPengguna: 0,
    tugasPending: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Proyek[]>([]);
  const [recentTasks, setRecentTasks] = useState<Tugas[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [proyekList, tugasList, penggunaList] = await Promise.all([
        proyekApi.getAll(),
        tugasApi.getAll(),
        penggunaApi.getAll(),
      ]);

      setStats({
        totalProyek: proyekList?.length || 0,
        totalTugas: tugasList?.length || 0,
        totalPengguna: penggunaList?.length || 0,
        tugasPending:
          tugasList?.filter((t) => t.status === "pending").length || 0,
      });

      // Ambil 5 proyek terbaru
      if (proyekList) setRecentProjects(proyekList.slice(0, 5));

      // Ambil 5 tugas terbaru
      if (tugasList) setRecentTasks(tugasList.slice(0, 5));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Proyek",
      value: stats.totalProyek,
      icon: FolderKanban,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Total Tugas",
      value: stats.totalTugas,
      icon: CheckSquare,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "Total Pengguna",
      value: stats.totalPengguna,
      icon: Users,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Tugas Pending",
      value: stats.tugasPending,
      icon: Clock,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      aktif: "bg-green-100 text-green-700",
      selesai: "bg-blue-100 text-blue-700",
      pending: "bg-yellow-100 text-yellow-700",
      dalam_proses: "bg-purple-100 text-purple-700",
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Selamat datang kembali! Berikut ringkasan aktivitas Anda.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Proyek Terbaru
            </h2>
          </div>
          <div className="p-6">
            {recentProjects.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Belum ada proyek</p>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((proyek) => (
                  <div
                    key={proyek.proyek_id}
                    className="flex items-start justify-between p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {proyek.nama_proyek}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {proyek.deskripsi || "Tidak ada deskripsi"}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {format(new Date(proyek.tanggal_mulai), "dd MMM yyyy", {
                          locale: id,
                        })}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        proyek.status
                      )}`}
                    >
                      {proyek.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Tugas Terbaru
            </h2>
          </div>
          <div className="p-6">
            {recentTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Belum ada tugas</p>
            ) : (
              <div className="space-y-4">
                {recentTasks.map((tugas) => (
                  <div
                    key={tugas.tugas_id}
                    className="flex items-start justify-between p-4 rounded-xl border border-gray-200 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {tugas.nama_tugas}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {tugas.deskripsi || "Tidak ada deskripsi"}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                            tugas.prioritas
                          )}`}
                        >
                          {tugas.prioritas}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            tugas.status
                          )}`}
                        >
                          {tugas.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
