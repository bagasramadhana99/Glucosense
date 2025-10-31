import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { FaCheckCircle, FaExclamationTriangle, FaArrowLeft, FaRobot } from 'react-icons/fa';
import { getGeminiRecommendation } from '../../api/gemini';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [recommendation, setRecommendation] = useState("Memuat rekomendasi AI...");
  const result = location.state?.result;

  useEffect(() => {
    if (!result) {
      navigate('/pasien/prediksi');
    } else {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [result, navigate]);

  useEffect(() => {
    if (result) {
      (async () => {
        const rec = await getGeminiRecommendation(result);
        setRecommendation(rec);
      })();
    }
  }, [result]);

  if (!result) return null;
  const isHighRisk = result.result === "Risiko Tinggi";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Header />
      <main className="p-4 pb-28 flex flex-col justify-center items-center" style={{ minHeight: 'calc(100vh - 128px)' }}>
        <button onClick={() => navigate(-1)} className="absolute top-20 left-4 text-gray-600 hover:text-indigo-600 flex items-center">
          <FaArrowLeft className="mr-2" /> Kembali
        </button>

        <div className={`bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl text-center transform transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {isHighRisk ? (
            <FaExclamationTriangle size={60} className="mx-auto text-red-500 animate-pulse" />
          ) : (
            <FaCheckCircle size={60} className="mx-auto text-green-500" />
          )}
          <h1 className="text-2xl font-bold text-gray-800 mt-6">Hasil Prediksi Risiko Anda</h1>
          <p className="text-gray-600 mt-4">
            Berdasarkan data yang Anda masukkan, prediksi risiko diabetes Anda adalah:
          </p>

          <p className={`text-5xl font-extrabold my-4 ${isHighRisk ? 'text-red-600' : 'text-green-600'}`}>
            {result.result}
          </p>

          <div className="mt-6 bg-gray-100 p-3 rounded-lg text-left">
            <p className="text-xs text-gray-600">
              <strong>Peringatan:</strong> Hasil ini adalah prediksi berdasarkan model dan tidak menggantikan diagnosis medis profesional.
            </p>
          </div>

          {/* Faktor Risiko */}
            <div className="mt-6 text-left">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Faktor Risiko Utama</h2>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
                {result.risk_factors.length > 0 ? (
                result.risk_factors.map((f, i) => (
                    <li key={i}>
                    {f.feature}: <span className="text-indigo-700 font-medium">{f.value}</span> 
                    {f.status ? <span className="text-gray-500 ml-1">({f.status})</span> : null}
                    </li>
                ))
                ) : (
                <li>Tidak ada faktor risiko signifikan terdeteksi.</li>
                )}
            </ul>
            </div>

          {/* Rekomendasi AI */}
          <div className="mt-8 bg-indigo-50 p-4 rounded-lg text-left shadow-inner">
            <h2 className="text-lg font-semibold text-indigo-800 flex items-center mb-2">
              <FaRobot className="mr-2" /> Rekomendasi dari AI (Gemini)
            </h2>
            <div className="text-sm text-gray-800 whitespace-pre-line">{recommendation}</div>
          </div>

          <button
            onClick={() => navigate('/pasien/prediksi')}
            className="mt-8 w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-indigo-700 transition"
          >
            Lakukan Prediksi Ulang
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
