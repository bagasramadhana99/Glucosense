import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaArrowLeft, 
  FaRobot, 
  FaLightbulb, 
  FaChevronDown, 
  FaChevronUp,
  FaInfoCircle,
  FaChartBar
} from 'react-icons/fa';
import { getGeminiRecommendation } from '../../api/gemini';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const result = location.state?.result;

  useEffect(() => {
    if (!result) {
      navigate('/pasien/prediksi');
    } else {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [result, navigate]);

  const fetchRecommendation = useCallback(async () => {
    setLoadingRecommendation(true);
    try {
      const text = await getGeminiRecommendation(result);
      setRecommendation(text);
    } catch (error) {
      console.error('Error fetching recommendation:', error);
    } finally {
      setLoadingRecommendation(false);
    }
  }, [result]);

  useEffect(() => {
    if (result && isVisible) {
      fetchRecommendation();
    }
  }, [result, isVisible, fetchRecommendation]);

  if (!result) return null;
  const isHighRisk = result.result === "Risiko Tinggi";

  return (
    <div className="bg-neutralBg min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-6 pb-24 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <h1 className="text-2xl font-bold text-textPrimary flex items-center">
            {isHighRisk ? (
              <FaExclamationTriangle className="mr-3 text-primaryRed" />
            ) : (
              <FaCheckCircle className="mr-3 text-successGreen" />
            )}
            Hasil Prediksi
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-textSecondary hover:text-primaryBlue flex items-center transition-colors"
          >
            <FaArrowLeft className="mr-1.5" /> Kembali
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hasil & Faktor Risiko */}
          <div className="lg:col-span-2">
            <div
              className={`bg-cardWhite p-6 rounded-2xl border border-lineGray transition-all duration-500 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              {/* Icon Status */}
              <div className="flex justify-center mb-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  isHighRisk ? 'bg-red-50' : 'bg-green-50'
                }`}>
                  {isHighRisk ? (
                    <FaExclamationTriangle size={36} className="text-primaryRed" />
                  ) : (
                    <FaCheckCircle size={36} className="text-successGreen" />
                  )}
                </div>
              </div>

              <p className="text-center text-sm text-textSecondary mb-6">
                Berdasarkan data yang Anda masukkan, hasil analisis menunjukkan:
              </p>

              {/* Hasil Utama */}
              <div className="text-center mb-8">
                <div className={`inline-block px-8 py-4 rounded-xl border-2 ${
                  isHighRisk ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                }`}>
                  <p className={`text-2xl font-bold ${isHighRisk ? 'text-primaryRed' : 'text-successGreen'}`}>
                    {result.result}
                  </p>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-5 bg-blue-50/50 rounded-xl border border-lineGray mb-8">
                <p className="text-xs text-textSecondary flex items-start">
                  <FaInfoCircle className="text-primaryBlue mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Catatan:</strong> Hasil ini bersifat informasional dan bukan pengganti diagnosis medis. 
                    Konsultasikan dengan dokter untuk evaluasi lengkap.
                  </span>
                </p>
              </div>

              {/* Faktor Risiko */}
              <div>
                <h2 className="text-lg font-bold text-textPrimary flex items-center mb-4">
                  <FaChartBar className="mr-2 text-primaryBlue" />
                  Faktor Risiko Utama
                </h2>
                <div className="bg-neutralBg/50 p-5 rounded-xl">
                  <ul className="space-y-3">
                    {result.risk_factors?.length > 0 ? (
                      result.risk_factors.map((f, i) => (
                        <li key={i} className="flex items-start bg-cardWhite p-3 rounded-lg border border-lineGray">
                          <span className="text-primaryBlue mr-3 mt-0.5">•</span>
                          <div className="flex-1 text-sm">
                            <span className="font-medium text-textPrimary">{f.feature}:</span>
                            <span className="text-primaryBlue ml-1">{f.value}</span>
                            {f.status && <span className="text-textSecondary ml-1">({f.status})</span>}
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-textSecondary p-3 bg-cardWhite rounded-lg border border-lineGray">
                        Tidak ada faktor risiko signifikan terdeteksi.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Rekomendasi AI - Desktop */}
          <div className="hidden lg:block">
            <div
              className={`bg-cardWhite p-6 rounded-2xl border border-lineGray transition-all duration-500 ease-out delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <h2 className="text-lg font-bold text-textPrimary flex items-center mb-5">
                <FaRobot className="mr-2 text-primaryBlue" />
                Rekomendasi
              </h2>

              {loadingRecommendation ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primaryBlue"></div>
                </div>
              ) : recommendation ? (
                <div className="space-y-4">
                  <div className="p-4 bg-neutralBg/50 rounded-xl">
                    <h3 className="font-semibold text-textPrimary mb-2 flex items-center text-sm">
                      <FaLightbulb className="mr-2 text-amber-500" />
                      Ringkasan
                    </h3>
                    <p className="text-xs text-textSecondary whitespace-pre-line leading-relaxed">
                      {recommendation}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50/50 rounded-lg border-l-4 border-primaryBlue">
                    <p className="text-xs text-textSecondary italic">
                      Prediksi ini bersifat informasional. Konsultasikan dengan dokter.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-sm text-textSecondary py-8">
                  Tidak dapat memuat rekomendas.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Rekomendasi AI */}
        <div className="lg:hidden mt-6">
          <button
            onClick={() => setShowRecommendation(!showRecommendation)}
            className="w-full p-4 bg-cardWhite rounded-xl border border-lineGray flex justify-between items-center transition-all hover:shadow"
          >
            <h2 className="text-lg font-bold text-textPrimary flex items-center">
              <FaRobot className="mr-2 text-primaryBlue" />
              Rekomendasi
            </h2>
            {showRecommendation ? (
              <FaChevronUp className="text-primaryBlue" />
            ) : (
              <FaChevronDown className="text-primaryBlue" />
            )}
          </button>

          {showRecommendation && (
            <div className="mt-4 p-6 bg-cardWhite rounded-xl border border-lineGray">
              {loadingRecommendation ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primaryBlue"></div>
                </div>
              ) : recommendation ? (
                <div className="space-y-4">
                  <div className="p-4 bg-neutralBg/50 rounded-xl">
                    <h3 className="font-semibold text-textPrimary mb-2 flex items-center text-sm">
                      <FaLightbulb className="mr-2 text-amber-500" />
                      Ringkasan
                    </h3>
                    <p className="text-xs text-textSecondary whitespace-pre-line leading-relaxed">
                      {recommendation}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50/50 rounded-lg border-l-4 border-primaryBlue">
                    <p className="text-xs text-textSecondary italic">
                      Prediksi ini bersifat informasional. Konsultasikan dengan dokter.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-sm text-textSecondary py-8">
                  Tidak dapat memuat rekomendasi.
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}