import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/axiosConfig";
import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";
import { FaHeartbeat, FaCalendarAlt, FaChartLine } from "react-icons/fa";

// === Skeleton Loader ===
const SkeletonCard = () => (
  <div className="bg-cardWhite p-6 rounded-2xl shadow-md border border-lineGray animate-pulse">
    <div className="flex justify-between items-center mb-4">
      <div className="h-5 bg-gray-200 rounded w-40"></div>
      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
    </div>
    <div className="grid grid-cols-2 gap-8">
      <div className="text-center">
        <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-2"></div>
        <div className="h-10 bg-gray-200 rounded w-20 mx-auto"></div>
      </div>
      <div className="text-center">
        <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-2"></div>
        <div className="h-10 bg-gray-200 rounded w-20 mx-auto"></div>
      </div>
    </div>
  </div>
);

// === Statistik Ringkasan ===
const StatisticsCard = memo(({ riwayat }) => {
  const stats = useMemo(() => {
    if (riwayat.length === 0) {
      return {
        avgGlucose: 0,
        minGlucose: 0,
        maxGlucose: 0,
        avgHeartRate: 0,
        minHeartRate: 0,
        maxHeartRate: 0,
        totalCheckups: 0
      };
    }

    const glucoseValues = riwayat.map(r => r.glucose_level);
    const heartRateValues = riwayat.map(r => r.heart_rate);

    return {
      avgGlucose: Math.round(glucoseValues.reduce((a, b) => a + b, 0) / glucoseValues.length),
      minGlucose: Math.min(...glucoseValues),
      maxGlucose: Math.max(...glucoseValues),
      avgHeartRate: Math.round(heartRateValues.reduce((a, b) => a + b, 0) / heartRateValues.length),
      minHeartRate: Math.min(...heartRateValues),
      maxHeartRate: Math.max(...heartRateValues),
      totalCheckups: riwayat.length
    };
  }, [riwayat]);

  return (
    <div className="bg-cardWhite p-5 rounded-2xl shadow-md border border-lineGray">
      <div className="flex items-center mb-4">
        <FaChartLine className="text-primaryBlue mr-2" />
        <h2 className="text-lg font-semibold text-textPrimary">Statistik Kesehatan</h2>
      </div>

      {riwayat.length === 0 ? (
        <p className="text-textSecondary text-center py-4">Belum ada data untuk ditampilkan</p>
      ) : (
        <div className="space-y-4">
          <div className="border-b border-lineGray pb-3">
            <p className="text-textSecondary text-sm mb-1">Total Pemeriksaan</p>
            <p className="text-2xl font-semibold text-textPrimary">{stats.totalCheckups}</p>
          </div>

          <div className="border-b border-lineGray pb-3">
            <p className="text-textSecondary text-sm mb-2">Gula Darah (mg/dL)</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-textSecondary">Rata-rata</p>
                <p className="text-lg font-semibold text-textPrimary">{stats.avgGlucose}</p>
              </div>
              <div>
                <p className="text-xs text-textSecondary">Terendah</p>
                <p className="text-lg font-semibold text-textPrimary">{stats.minGlucose}</p>
              </div>
              <div>
                <p className="text-xs text-textSecondary">Tertinggi</p>
                <p className="text-lg font-semibold text-textPrimary">{stats.maxGlucose}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-textSecondary text-sm mb-2">Detak Jantung (bpm)</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-textSecondary">Rata-rata</p>
                <p className="text-lg font-semibold text-textPrimary">{stats.avgHeartRate}</p>
              </div>
              <div>
                <p className="text-xs text-textSecondary">Terendah</p>
                <p className="text-lg font-semibold text-textPrimary">{stats.minHeartRate}</p>
              </div>
              <div>
                <p className="text-xs text-textSecondary">Tertinggi</p>
                <p className="text-lg font-semibold text-textPrimary">{stats.maxHeartRate}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// === Komponen Utama ===
export default function RiwayatPage() {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const navigate = useNavigate();

  // === Ambil User dari sessionStorage ===
  useEffect(() => {
    try {
      const userData = JSON.parse(sessionStorage.getItem("user"));
      if (!userData || !userData.id) {
        navigate("/login", { replace: true });
      } else {
        setUser(userData);
      }
    } catch (err) {
      console.error("Gagal parse user:", err);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // === Fetch Riwayat dengan Polling Aman ===
  const fetchRiwayat = useCallback(async () => {
    if (!user) return;

    try {
      const response = await apiClient.get("/monitoring/me");
      const data = response.data || [];

      // Urutkan dari terbaru ke terlama
      const sorted = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setRiwayat(sorted);
      setError("");
    } catch (err) {
      console.error("Gagal fetch riwayat:", err);
      if (!error) {
        setError("Gagal memuat riwayat. Coba lagi nanti.");
      }
    } finally {
      setLoading(false);
    }
  }, [user, error]);

  useEffect(() => {
    if (!user) return;

    fetchRiwayat();
    const intervalId = setInterval(fetchRiwayat, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [user, fetchRiwayat]);

  // === Pagination ===
  const totalPages = Math.max(1, Math.ceil(riwayat.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedRiwayat = useMemo(() => {
    return riwayat.slice(startIndex, startIndex + itemsPerPage);
  }, [riwayat, startIndex, itemsPerPage]);

  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  // === Format Tanggal WIB ===
  const formatWIB = (timestamp) => {
    const date = new Date(timestamp);
    const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000); // UTC+7
    return wib.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB";
  };

  return (
    <div className="bg-neutralBg min-h-screen">
      <Header />
      <main className="pt-6 pb-32 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-textPrimary">
            Riwayat Pemeriksaan
          </h1>
          <p className="text-textSecondary mt-2 text-sm md:text-base">
            Catatan hasil pemeriksaan kadar glukosa dan detak jantung Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* === Kolom Kanan - Statistik (Pertama di Mobile) === */}
          <div className="md:col-span-1 order-first md:order-last">
            <StatisticsCard riwayat={riwayat} />
          </div>

          {/* === Kolom Kiri - Daftar Riwayat (Kedua di Mobile) === */}
          <div className="md:col-span-2 order-last md:order-first space-y-6">
            {loading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : error && riwayat.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-errorRed text-lg">{error}</p>
              </div>
            ) : riwayat.length === 0 ? (
              <div className="bg-cardWhite p-8 rounded-2xl shadow-lg border border-lineGray text-center">
                <p className="text-textSecondary text-lg">
                  Belum ada data riwayat pemeriksaan.
                </p>
                <button
                  onClick={() => navigate("/pasien/pemeriksaan")}
                  className="mt-4 inline-block px-6 py-2 bg-primaryBlue text-white rounded-lg font-medium hover:bg-softBlue transition"
                >
                  Mulai Pemeriksaan
                </button>
              </div>
            ) : (
              <>
                {displayedRiwayat.map((item) => (
                  <div
                    key={item.id}
                    className="bg-cardWhite p-6 rounded-2xl shadow-md border border-lineGray hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center text-textSecondary text-sm">
                        <FaCalendarAlt className="mr-2 text-softBlue" />
                        {formatWIB(item.timestamp)}
                      </div>
                      <FaHeartbeat className="text-primaryRed text-xl animate-pulse" />
                    </div>

                    <div className="grid grid-cols-2 gap-8 text-center">
                      <div>
                        <p className="text-textSecondary text-sm">Glukosa Darah</p>
                        <p className="text-3xl font-semibold text-textPrimary mt-2">
                          {item.glucose_level}{" "}
                          <span className="text-sm font-normal text-textSecondary">
                            mg/dL
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-textSecondary text-sm">Detak Jantung</p>
                        <p className="text-3xl font-semibold text-textPrimary mt-2">
                          {item.heart_rate}{" "}
                          <span className="text-sm font-normal text-textSecondary">
                            bpm
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* === Pagination === */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-8">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-lineGray text-softBlue disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutralBg transition"
                      aria-label="Halaman sebelumnya"
                    >
                      ←
                    </button>
                    <span className="text-textSecondary font-medium">
                      Halaman {currentPage} dari {totalPages}
                    </span>
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg border border-lineGray text-softBlue disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutralBg transition"
                      aria-label="Halaman berikutnya"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}