import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosConfig';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { FaChartLine, FaInfoCircle, FaCalendarAlt } from 'react-icons/fa';

export default function GlucoseTrendPage() {
    // State untuk menyimpan 3 data terakhir lengkap (termasuk timestamp)
    const [latestHistory, setLatestHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [isLoading, setIsLoading] = useState(false); // Loading untuk prediksi
    const [error, setError] = useState('');
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

    // --- FUNGSI FORMAT TANGGAL DISESUAIKAN ---
    const formatDate = (timestamp) => {
        if (!timestamp) return '-';

        return new Date(timestamp).toLocaleString('id-ID', {
            // timeZone: 'UTC', // <-- Dihapus
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }); // <-- Teks ' (UTC)' dihapus dari sini
    };
    // ------------------------------------------

    return (
        <div className="bg-gray-50 min-h-screen">
            <Header />
            <main className="p-4 pb-28">
                <h1 className="text-2xl font-bold mb-1 text-gray-800 flex items-center">
                    <FaChartLine className="mr-2 text-indigo-500" />
                    Prediksi Tren Glukosa
                </h1>
                <p className="text-gray-600 mb-6">Menganalisis 3 data glukosa terakhir Anda untuk memprediksi tren 5 hari ke depan.</p>
                
                {loadingHistory && (
                    <div className="text-center p-4 bg-blue-50 text-blue-700 rounded-lg shadow mb-6 animate-pulse">Memuat data pemeriksaan terakhir...</div>
                )}
                {!loadingHistory && error && (
                     <div className="text-center p-4 bg-red-50 text-red-700 rounded-lg shadow mb-6">{error}</div>
                )}

                {/* Tampilkan Data Input */}
                {!loadingHistory && !error && latestHistory.length === 3 && (
                    <div className="mb-6 bg-white p-5 rounded-xl shadow-md border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                           <FaInfoCircle className="mr-2 text-blue-500"/> Data Pemeriksaan Terakhir Digunakan:
                        </h2>
                        <div className="space-y-3">
                            {latestHistory.map((item, index) => (
                                <div key={item.id} 
                                     className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-lg ${index === 0 ? 'bg-red-50' : index === 1 ? 'bg-yellow-50' : 'bg-green-50'}`}
                                >
                                    <div className="flex items-center text-sm text-gray-600 mb-1 sm:mb-0">
                                        <FaCalendarAlt className="mr-2 opacity-70" />
                                        {formatDate(item.timestamp)} {/* Sekarang akan menampilkan waktu lokal */}
                                    </div>
                                    <strong className={`text-lg font-bold ${index === 0 ? 'text-red-700' : index === 1 ? 'text-yellow-700' : 'text-green-700'}`}>
                                        {item.glucose_level} mg/dL
                                    </strong>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Tombol Prediksi */}
                <form onSubmit={handleSubmit}>
                    <button 
                        type="submit" 
                        disabled={isLoading || loadingHistory || !!error || latestHistory.length < 3} 
                        className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Memprediksi...' : 'Lihat Prediksi Tren'}
                    </button>
                </form>
                
                 {error && !loadingHistory && latestHistory.length === 3 && (
                     <p className="mt-4 text-center text-red-600">{error}</p>
                 )}

            </main>
            <BottomNav />
        </div>
    );
}