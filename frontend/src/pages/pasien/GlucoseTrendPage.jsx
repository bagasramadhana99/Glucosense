import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosConfig';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { FaChartLine, FaInfoCircle, FaCalendarAlt, FaExclamationTriangle, FaArrowRight } from 'react-icons/fa';

// Skeleton Loader
const GlucoseDataSkeleton = () => (
  <div className="bg-cardWhite p-5 rounded-2xl shadow-md border border-lineGray">
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
);

export default function GlucoseTrendPage() {
    // State untuk menyimpan 3 data terakhir lengkap (termasuk timestamp)
    const [latestHistory, setLatestHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [isLoading, setIsLoading] = useState(false); // Loading untuk prediksi
    const [error, setError] = useState('');
    const [showInfo, setShowInfo] = useState(false);
    const navigate = useNavigate();

    // Ambil 3 data riwayat terakhir saat komponen dimuat
    useEffect(() => {
        const fetchLatestHistory = async () => {
            setLoadingHistory(true);
            setError('');
            try {
                const response = await apiClient.get('/monitoring/me');
                const sortedData = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                if (sortedData.length >= 3) {
                    const lastThreeFull = sortedData.slice(0, 3).reverse();
                    setLatestHistory(lastThreeFull);
                } else {
                    setError("Data riwayat pemeriksaan tidak cukup (minimal 3 data diperlukan).");
                }
            } catch (err) {
                console.error("Gagal mengambil data riwayat:", err);
                setError("Gagal memuat data riwayat pemeriksaan terakhir.");
            } finally {
                setLoadingHistory(false);
            }
        };

        fetchLatestHistory();
    }, []);

    // Fungsi submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loadingHistory || error || latestHistory.length < 3) {
            alert("Data riwayat belum siap atau tidak cukup.");
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const glucoseReadings = latestHistory.map(item => item.glucose_level);
            const response = await apiClient.post('/predict/glucose-trend', { glucose_readings: glucoseReadings });
            navigate('/pasien/hasil-tren', { state: { result: response.data } });

        } catch (err) {
            console.error("Gagal melakukan prediksi tren:", err);
            setError(err.response?.data?.error || err.message || "Terjadi kesalahan saat prediksi.");
        } finally {
            setIsLoading(false);
        }
    };

    // Fungsi format tanggal
    const formatDate = (timestamp) => {
        if (!timestamp) return '-';

        return new Date(timestamp).toLocaleString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="bg-neutralBg min-h-screen">
            <Header />
            <main className="pt-6 pb-32 px-4 md:px-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-textPrimary flex items-center">
                        <FaChartLine className="mr-3 text-primaryBlue" />
                        Prediksi Tren Glukosa
                    </h1>
                    <p className="text-textSecondary mt-2">
                        Menganalisis 3 data glukosa terakhir Anda untuk memprediksi tren 5 hari ke depan.
                    </p>
                </div>
                
                {/* Loading State */}
                {loadingHistory && (
                    <div className="mb-6">
                        <GlucoseDataSkeleton />
                    </div>
                )}
                
                {/* Error State */}
                {!loadingHistory && error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                        <FaExclamationTriangle className="text-errorRed mt-0.5 mr-2 flex-shrink-0" />
                        <p className="text-sm text-errorRed">{error}</p>
                    </div>
                )}

                {/* Data Input */}
                {!loadingHistory && !error && latestHistory.length === 3 && (
                    <div className="space-y-6">
                        {/* Card Data Pemeriksaan */}
                        <div className="bg-cardWhite p-6 rounded-2xl shadow-md border border-lineGray">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-textPrimary flex items-center">
                                    <FaInfoCircle className="mr-2 text-infoBlue" />
                                    Data Pemeriksaan Terakhir
                                </h2>
                                <button 
                                    onClick={() => setShowInfo(!showInfo)}
                                    className="text-softBlue hover:text-primaryBlue transition-colors"
                                    aria-label="Toggle info"
                                >
                                    <FaInfoCircle />
                                </button>
                            </div>
                            
                            {showInfo && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-xs text-textSecondary">
                                        <span className="font-semibold">Cara Kerja:</span> Sistem kami menganalisis pola dari 3 data glukosa terakhir untuk memproyeksikan kemungkinan tren glukosa darah Anda dalam 5 hari ke depan. Semakin konsisten jarak waktu antar pemeriksaan, semakin akurat prediksi yang dihasilkan.
                                    </p>
                                </div>
                            )}
                            
                            {/* Data Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {latestHistory.map((item) => (
                                    <div key={item.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                                        <div className="text-xl font-bold text-textPrimary mb-2">
                                            {item.glucose_level} 
                                            <span className="text-sm text-textSecondary ml-1">mg/dL</span>
                                        </div>
                                        <div className="text-xs text-textSecondary flex items-center">
                                            <FaCalendarAlt className="mr-1 opacity-70" />
                                            {formatDate(item.timestamp)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Card Informasi Tambahan */}
                        <div className="bg-cardWhite p-6 rounded-2xl shadow-md border border-lineGray">
                            <h3 className="text-base font-semibold text-textPrimary mb-3">Informasi Penting</h3>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <div className="w-5 h-5 rounded-full bg-primaryBlue flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                        <span className="text-white text-xs font-bold">1</span>
                                    </div>
                                    <p className="text-sm text-textSecondary">
                                        Hasil prediksi adalah estimasi berdasarkan data historis dan tidak menggantikan konsultasi medis.
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-5 h-5 rounded-full bg-primaryBlue flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                        <span className="text-white text-xs font-bold">2</span>
                                    </div>
                                    <p className="text-sm text-textSecondary">
                                        Faktor seperti diet, aktivitas fisik, dan obat-obatan dapat memengaruhi kadar glukosa darah Anda.
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-5 h-5 rounded-full bg-primaryBlue flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                        <span className="text-white text-xs font-bold">3</span>
                                    </div>
                                    <p className="text-sm text-textSecondary">
                                        Semakin konsisten jarak waktu antar pemeriksaan, semakin akurat prediksi yang dihasilkan.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Tombol Prediksi */}
                        <form onSubmit={handleSubmit}>
                            <button 
                                type="submit" 
                                disabled={isLoading || loadingHistory || !!error || latestHistory.length < 3} 
                                className="w-full bg-primaryBlue text-white font-medium py-3 px-4 rounded-lg shadow hover:bg-softBlue focus:outline-none focus:ring-2 focus:ring-primaryBlue focus:ring-offset-2 disabled:bg-mutedGray disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memprediksi...
                                    </>
                                ) : (
                                    <>
                                        Lihat Prediksi Tren
                                        <FaArrowRight className="ml-2" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}
                
                {/* Error Message */}
                {error && !loadingHistory && latestHistory.length === 3 && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                        <FaExclamationTriangle className="text-errorRed mt-0.5 mr-2 flex-shrink-0" />
                        <p className="text-sm text-errorRed">{error}</p>
                    </div>
                )}

            </main>
            <BottomNav />
        </div>
    );
}