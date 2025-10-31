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
  FaChartBar,
  FaHeartbeat
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
      const recommendationText = await getGeminiRecommendation(result);
      setRecommendation(recommendationText);
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
    <div className="bg-neutralBg min-h-screen">
      <Header />
      <main className="pt-6 pb-32 px-4 md:px-8">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-textPrimary flex items-center">
            {isHighRisk ? (
              <FaExclamationTriangle className="mr-3 text-errorRed" />
            ) : (
              <FaCheckCircle className="mr-3 text-successGreen" />
            )}
            Hasil Prediksi Risiko Diabetes
          </h1>
          <button 
            onClick={() => navigate(-1)} 
            className="text-sm text-textSecondary hover:text-softBlue flex items-center transition"
          >
            <FaArrowLeft className="mr-1" /> Kembali
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hasil Prediksi dan Faktor Risiko */}
          <div className="lg:col-span-2">
            <div 
              className={`bg-cardWhite p-6 md:p-8 rounded-2xl shadow-lg border border-lineGray transform transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              {/* Header Card */}
              <div className="flex items-center justify-center mb-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  isHighRisk ? 'bg-red-50' : 'bg-green-50'
                }`}>
                  {isHighRisk ? (
                    <FaExclamationTriangle size={36} className="text-errorRed" />
                  ) : (
                    <FaCheckCircle size={36} className="text-successGreen" />
                  )}
                </div>
              </div>
              
              <p className="text-center text-textSecondary mb-6 text-base">
                Berdasarkan data yang Anda masukkan, hasil analisis menunjukkan:
              </p>
              
              {/* Hasil Prediksi */}
              <div className="text-center mb-8">
                <div className={`inline-block px-8 py-4 rounded-xl shadow-sm ${
                  isHighRisk ? 'bg-red-50 border-2 border-red-200' : 'bg-green-50 border-2 border-green-200'
                }`}>
                  <p className={`text-3xl font-bold ${isHighRisk ? 'text-errorRed' : 'text-successGreen'}`}>
                    {result.result}
                  </p>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-neutralBg p-4 rounded-xl border border-lineGray mb-8">
                <div className="flex items-start">
                  <FaInfoCircle className="text-infoBlue mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-textSecondary">
                    <strong>Informasi Penting:</strong> Hasil ini merupakan prediksi berdasarkan model analisis data dan tidak dapat menggantikan diagnosis medis profesional. Untuk evaluasi kesehatan yang komprehensif, disarankan untuk berkonsultasi dengan tenaga medis.
                  </p>
                </div>
              </div>

              {/* Faktor Risiko */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-textPrimary flex items-center mb-4">
                  <FaChartBar className="mr-2 text-primaryBlue" />
                  Faktor Risiko Utama
                </h2>
                <div className="bg-neutralBg p-6 rounded-xl">
                  <ul className="space-y-3">
                    {result.risk_factors && result.risk_factors.length > 0 ? (
                      result.risk_factors.map((f, i) => (
                        <li key={i} className="flex items-start bg-cardWhite p-3 rounded-lg shadow-sm">
                          <span className="text-primaryBlue mr-3 mt-1">•</span>
                          <div className="flex-1">
                            <span className="font-medium text-textPrimary">{f.feature}:</span>
                            <span className="text-softBlue ml-1">{f.value}</span>
                            {f.status && <span className="text-textSecondary ml-1">({f.status})</span>}
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="text-textSecondary p-3 bg-cardWhite rounded-lg shadow-sm">Tidak ada faktor risiko signifikan terdeteksi.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Rekomendasi AI - Desktop View */}
          <div className="hidden lg:block lg:col-span-1">
            <div 
              className={`bg-cardWhite p-6 rounded-2xl shadow-lg border border-lineGray transform transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <h2 className="text-xl font-bold text-textPrimary flex items-center mb-6">
                <FaRobot className="mr-2 text-primaryBlue" />
                Rekomendasi AI
              </h2>
              
              {loadingRecommendation ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryBlue"></div>
                </div>
              ) : recommendation ? (
                <div className="space-y-4">
                  {/* Ringkasan AI */}
                  <div className="bg-neutralBg p-4 rounded-xl">
                    <h3 className="font-semibold text-textPrimary mb-3 flex items-center">
                      <FaLightbulb className="mr-2 text-warningAmber" />
                      Ringkasan AI
                    </h3>
                    <p className="text-textSecondary text-sm whitespace-pre-line">{recommendation}</p>
                  </div>
                  
                  {/* Catatan */}
                  <div className="bg-infoBlue/10 p-4 rounded-xl border-l-4 border-infoBlue">
                    <p className="text-textSecondary text-xs italic">
                      Hasil ini merupakan prediksi berdasarkan model analisis data dan tidak dapat menggantikan diagnosis medis profesional.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-textSecondary">Tidak dapat memuat rekomendasi AI saat ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tombol Rekomendasi AI - Mobile View */}
        <div className="lg:hidden mt-6">
          <button
            onClick={() => setShowRecommendation(!showRecommendation)}
            className="w-full bg-cardWhite p-4 rounded-xl shadow-lg border border-lineGray flex justify-between items-center transition-all duration-300"
          >
            <h2 className="text-lg font-bold text-textPrimary flex items-center">
              <FaRobot className="mr-2 text-primaryBlue" />
              Rekomendasi AI
            </h2>
            {showRecommendation ? (
              <FaChevronUp className="text-primaryBlue" />
            ) : (
              <FaChevronDown className="text-primaryBlue" />
            )}
          </button>

          {/* Rekomendasi AI Content - Mobile View */}
          {showRecommendation && (
            <div className="mt-4 bg-cardWhite p-6 rounded-xl shadow-lg border border-lineGray">
              {loadingRecommendation ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryBlue"></div>
                </div>
              ) : recommendation ? (
                <div className="space-y-4">
                  {/* Ringkasan AI */}
                  <div className="bg-neutralBg p-4 rounded-xl">
                    <h3 className="font-semibold text-textPrimary mb-3 flex items-center">
                      <FaLightbulb className="mr-2 text-warningAmber" />
                      Ringkasan AI
                    </h3>
                    <p className="text-textSecondary text-sm whitespace-pre-line">{recommendation}</p>
                  </div>
                  
                  {/* Catatan */}
                  <div className="bg-infoBlue/10 p-4 rounded-xl border-l-4 border-infoBlue">
                    <p className="text-textSecondary text-xs italic">
                      Hasil ini merupakan prediksi berdasarkan model analisis data dan tidak dapat menggantikan diagnosis medis profesional.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-textSecondary">Tidak dapat memuat rekomendasi AI saat ini.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}