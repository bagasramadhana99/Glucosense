import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/axiosConfig";
import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";
import { FaHeartbeat, FaCalendarAlt, FaChartLine } from "react-icons/fa";

// === Skeleton Loader ===
const SkeletonCard = () => (
  <div className="bg-cardWhite p-6 rounded-2xl border border-lineGray animate-pulse">
    <div className="h-5 bg-gray-200 rounded w-36 mb-4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-4/5"></div>
    </div>
  </div>
);

// === Statistik Ringkasan ===
const StatisticsCard = memo(({ riwayat }) => {
  const stats = useMemo(() => {
    if (!riwayat.length) return null;
    const g = riwayat.map(r => r.glucose_level);
    const h = riwayat.map(r => r.heart_rate);
    return {
      total: riwayat.length,
      avgG: Math.round(g.reduce((a, b) => a + b, 0) / g.length),
      minG: Math.min(...g),
      maxG: Math.max(...g),
      avgH: Math.round(h.reduce((a, b) => a + b, 0) / h.length),
      minH: Math.min(...h),
      maxH: Math.max(...h),
    };
  }, [riwayat]);

  if (!stats) return (
    <div className="bg-cardWhite p-5 rounded-2xl border border-lineGray text-center py-8">
      <p className="text-textSecondary text-sm">Belum ada data</p>
    </div>
  );

  return (
    <div className="bg-cardWhite p-5 rounded-2xl border border-lineGray">
      <h3 className="text-base font-semibold text-textPrimary mb-3 flex items-center">
        <FaChartLine className="text-primaryBlue mr-2 text-sm" />
        Ringkasan
      </h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-textSecondary">Total</span>
          <span className="font-medium">{stats.total} kali</span>
        </div>
        <div className="pt-2 border-t border-lineGray text-xs">
          <p className="text-textSecondary mb-2">Glukosa (mg/dL)</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-textSecondary">Rata-rata</p>
              <p className="font-semibold">{stats.avgG}</p>
            </div>
            <div>
              <p className="text-successGreen">Terendah</p>
              <p className="font-semibold text-successGreen">{stats.minG}</p>
            </div>
            <div>
              <p className="text-errorRed">Tertinggi</p>
              <p className="font-semibold text-errorRed">{stats.maxG}</p>
            </div>
          </div>
        </div>
        <div className="pt-3 border-t border-lineGray text-xs">
          <p className="text-textSecondary mb-2">Detak Jantung (bpm)</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-textSecondary">Rata-rata</p>
              <p className="font-semibold">{stats.avgH}</p>
            </div>
            <div>
              <p className="text-successGreen">Terendah</p>
              <p className="font-semibold text-successGreen">{stats.minH}</p>
            </div>
            <div>
              <p className="text-errorRed">Tertinggi</p>
              <p className="font-semibold text-errorRed">{stats.maxH}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// === Item Riwayat ===
const HistoryItem = memo(({ item }) => {
  const date = new Date(item.timestamp);
  const formatted = date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const time = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-cardWhite p-6 rounded-2xl border border-lineGray">
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm text-textSecondary flex items-center">
          <FaCalendarAlt className="mr-1.5 text-xs" />
          {formatted} • {time} WIB
        </p>
        <FaHeartbeat className="text-primaryRed text-lg" />
      </div>
      <div className="grid grid-cols-2 gap-6 text-center">
        <div>
          <p className="text-xs text-textSecondary mb-1">Glukosa</p>
          <p className="text-2xl font-bold text-textPrimary">
            {item.glucose_level}
            <span className="text-sm font-normal text-textSecondary ml-1">mg/dL</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-textSecondary mb-1">Detak Jantung</p>
          <p className="text-2xl font-bold text-textPrimary">
            {item.heart_rate}
            <span className="text-sm font-normal text-textSecondary ml-1">bpm</span>
          </p>
        </div>
      </div>
    </div>
  );
});

// === Empty State ===
const EmptyState = memo(({ onStart }) => (
  <div className="bg-cardWhite p-8 rounded-2xl border border-lineGray text-center">
    <div className="w-16 h-16 mx-auto bg-primaryBlue/10 rounded-full flex items-center justify-center mb-4">
      <FaHeartbeat className="text-primaryRed text-2xl" />
    </div>
    <h3 className="text-lg font-semibold text-textPrimary mb-1">Belum Ada Riwayat</h3>
    <p className="text-sm text-textSecondary mb-4">Mulai pemeriksaan untuk melihat catatan Anda.</p>
    <button
      onClick={onStart}
      className="text-sm font-medium text-primaryBlue hover:text-softBlue transition"
    >
      Mulai Pemeriksaan
    </button>
  </div>
));

// === Komponen Utama ===
export default function RiwayatPage() {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  // === User Check ===
  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("user") || "{}");
    if (!userData?.id) {
      navigate("/login", { replace: true });
    } else {
      setUser(userData);
    }
  }, [navigate]);

  // === Fetch Riwayat ===
  const fetchRiwayat = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await apiClient.get("/monitoring/me");
      const sorted = (data || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setRiwayat(sorted);
    } catch (err) {
      console.error("Gagal fetch riwayat:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchRiwayat();
    const id = setInterval(fetchRiwayat, 5000);
    return () => clearInterval(id);
  }, [user, fetchRiwayat]);

  // === Pagination ===
  const totalPages = Math.ceil(riwayat.length / itemsPerPage) || 1;
  const start = (currentPage - 1) * itemsPerPage;
  const displayed = useMemo(() => riwayat.slice(start, start + itemsPerPage), [riwayat, start, itemsPerPage]);

  const goToPage = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  return (
    <div className="bg-neutralBg min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-6 pb-24 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-textPrimary">Riwayat</h1>
          <p className="text-textSecondary text-sm mt-1">
            Catatan hasil pemeriksaan glukosa dan detak jantung Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Daftar Riwayat */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
            ) : riwayat.length === 0 ? (
              <EmptyState onStart={() => navigate("/pasien/pemeriksaan")} />
            ) : (
              <>
                {displayed.map((item) => (
                  <HistoryItem key={item.id} item={item} />
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="text-sm text-softBlue disabled:text-gray-400 hover:underline"
                    >
                      ← Sebelumnya
                    </button>
                    <span className="text-xs text-textSecondary">
                      Halaman {currentPage} dari {totalPages}
                    </span>
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="text-sm text-softBlue disabled:text-gray-400 hover:underline"
                    >
                      Berikutnya →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right: Statistik */}
          <div>
            <StatisticsCard riwayat={riwayat} />
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}