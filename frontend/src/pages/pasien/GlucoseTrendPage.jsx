import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosConfig';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { FaChartLine, FaInfoCircle, FaCalendarAlt, FaExclamationTriangle, FaArrowRight } from 'react-icons/fa';

// Skeleton Loader
const GlucoseDataSkeleton = () => (
  <div className="bg-cardWhite p-5 rounded-2xl border border-lineGray">
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-neutralBg/50">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-lineGray rounded-full mr-2"></div>
            <div className="h-4 bg-lineGray rounded w-32 animate-pulse"></div>
          </div>
          <div className="h-5 bg-lineGray rounded w-16 animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
);

export default function GlucoseTrendPage() {
  const [latestHistory, setLatestHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const navigate = useNavigate();

  // Ambil 3 data terakhir
  useEffect(() => {
    const fetchLatestHistory = async () => {
      setLoadingHistory(true);
      setError('');
      try {
        const { data } = await apiClient.get('/monitoring/me');
        const sorted = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        if (sorted.length >= 3) {
          setLatestHistory(sorted.slice(0, 3).reverse());
        } else {
          setError('Minimal 3 data pemeriksaan diperlukan untuk prediksi tren.');
        }
      } catch {
        setError('Gagal memuat data riwayat.');
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchLatestHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loadingHistory || error || latestHistory.length < 3) return;

    setIsLoading(true);
    setError('');

    try {
      const glucoseReadings = latestHistory.map(item => item.glucose_level);
      const { data } = await apiClient.post('/predict/glucose-trend', { glucose_readings: glucoseReadings });
      navigate('/pasien/hasil-tren', { state: { result: data } });
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal melakukan prediksi.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="bg-neutralBg min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-6 pb-24 px-4 md:px-8 lg:px-12 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-textPrimary flex items-center">
            <FaChartLine className="mr-3 text-primaryBlue" />
            Prediksi Tren Glukosa
          </h1>
          <p className="text-sm text-textSecondary mt-1">
            Analisis 3 data terakhir untuk proyeksi 5 hari ke depan.
          </p>
        </div>

        {/* Loading */}
        {loadingHistory && <GlucoseDataSkeleton />}

        {/* Error */}
        {!loadingHistory && error && (
          <div className="p-5 bg-red-50/50 rounded-xl border border-red-200 mb-6">
            <p className="text-sm text-primaryRed flex items-start">
              <FaExclamationTriangle className="mr-2 mt-0.5 flex-shrink-0" />
              {error}
            </p>
          </div>
        )}

        {/* Data Valid */}
        {!loadingHistory && !error && latestHistory.length === 3 && (
          <div className="space-y-6">
            {/* Data Pemeriksaan */}
            <div className="bg-cardWhite p-6 rounded-2xl border border-lineGray">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold text-textPrimary flex items-center">
                  <FaInfoCircle className="mr-2 text-primaryBlue" />
                  Data Terakhir
                </h2>
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className="text-primaryBlue hover:text-blue-700 transition-colors"
                  aria-label="Info"
                >
                  <FaInfoCircle size={18} />
                </button>
              </div>

              {showInfo && (
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 mb-5 text-xs text-textSecondary">
                  Sistem menganalisis pola dari 3 data glukosa terakhir untuk memproyeksikan tren 5 hari ke depan. 
                  Konsistensi waktu pemeriksaan meningkatkan akurasi.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {latestHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-neutralBg/50 rounded-xl border border-lineGray hover:bg-neutralBg/70 transition-colors"
                  >
                    <div className="text-xl font-bold text-textPrimary">
                      {item.glucose_level}
                      <span className="text-sm text-textSecondary ml-1">mg/dL</span>
                    </div>
                    <div className="text-xs text-textSecondary flex items-center mt-1">
                      <FaCalendarAlt className="mr-1.5 opacity-70" />
                      {formatDate(item.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Informasi Penting */}
            <div className="bg-cardWhite p-6 rounded-2xl border border-lineGray">
              <h3 className="text-base font-semibold text-textPrimary mb-4">Catatan Penting</h3>
              <div className="space-y-3 text-sm text-textSecondary">
                {[
                  'Prediksi ini hanya estimasi, bukan pengganti konsultasi dokter.',
                  'Diet, olahraga, dan obat memengaruhi kadar glukosa.',
                  'Konsistensi waktu pemeriksaan = akurasi lebih tinggi.'
                ].map((text, i) => (
                  <div key={i} className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-primaryBlue flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="text-white text-xs font-bold">{i + 1}</span>
                    </div>
                    <p>{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tombol Prediksi */}
            <form onSubmit={handleSubmit}>
              <button
                type="submit"
                disabled={isLoading || loadingHistory || !!error}
                className="w-full py-3 px-4 bg-primaryBlue hover:bg-blue-600 disabled:bg-mutedGray disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm flex items-center justify-center transition-all duration-200 hover:shadow"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
      </main>

      <BottomNav />
    </div>
  );
}