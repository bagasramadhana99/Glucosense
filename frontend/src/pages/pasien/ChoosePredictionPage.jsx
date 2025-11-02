import React, { useCallback, useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { FaArrowRight, FaChartLine, FaHeartbeat } from 'react-icons/fa';

// === Trend Chart (Animasi Masuk) ===
const TrendChart = memo(() => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const heights = [35, 55, 40, 70, 50, 65, 80];

  return (
    <div className="flex items-end justify-between h-20 w-full px-2">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-3 bg-gradient-to-t from-primaryBlue/20 to-primaryBlue rounded-t-lg transition-all duration-700 ease-out"
          style={{
            height: mounted ? `${h}%` : '0%',
            opacity: mounted ? 1 : 0,
            transitionDelay: `${i * 80}ms`,
          }}
        />
      ))}
    </div>
  );
});

// === Risk Gauge (Animasi Lingkaran) ===
const RiskGauge = memo(() => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative h-20 w-20">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r="24" stroke="currentColor" strokeWidth="3" fill="none" className="text-lineGray" />
        <circle
          cx="26"
          cy="26"
          r="24"
          stroke="url(#riskGrad)"
          strokeWidth="4"
          fill="none"
          strokeDasharray="150.8"
          strokeDashoffset={mounted ? '37.7' : '150.8'}
          className="transition-all duration-1200 ease-out"
        />
        <defs>
          <linearGradient id="riskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <span className="text-lg font-bold text-primaryRed">75</span>
          <span className="text-xs text-primaryRed block -mt-1">%</span>
        </div>
      </div>
    </div>
  );
});

// === Prediction Card (Hover Interaktif) ===
const PredictionCard = memo(function PredictionCard({ title, description, icon, onClick, isPrimary, visual }) {
  const [hovered, setHovered] = useState(false);
  const IconComp = icon;
  const VisualComp = visual;

  return (
    <div
      className="bg-cardWhite p-6 rounded-2xl border border-lineGray flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon + Visual */}
      <div className="flex items-center justify-between mb-5">
        <div
          className={`p-3.5 rounded-xl transition-all duration-300 ${
            hovered ? 'scale-110' : 'scale-100'
          } ${isPrimary ? 'bg-red-50 text-primaryRed' : 'bg-blue-50 text-primaryBlue'}`}
        >
          <IconComp size={22} />
        </div>
        <div className={`opacity-30 ${hovered ? 'opacity-50' : ''} transition-opacity`}>
          <VisualComp />
        </div>
      </div>

      {/* Title & Description */}
      <h3 className="text-lg font-bold text-textPrimary mb-2">{title}</h3>
      <p className="text-sm text-textSecondary mb-6 flex-1 leading-relaxed">{description}</p>

      {/* Button */}
      <button
        onClick={onClick}
        className={`w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center transition-all duration-200 hover:shadow ${
          isPrimary ? 'bg-primaryRed hover:bg-red-600 text-white' : 'bg-primaryBlue hover:bg-blue-600 text-white'
        }`}
      >
        Mulai Prediksi
        <FaArrowRight className="ml-2 text-xs transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
});

export default function ChoosePredictionPage() {
  const navigate = useNavigate();

  const goToRisk = useCallback(() => navigate('/pasien/prediksi-risiko'), [navigate]);
  const goToTrend = useCallback(() => navigate('/pasien/prediksi-tren'), [navigate]);

  return (
    <div className="bg-neutralBg min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-6 pb-24 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full">
        {/* Header – Rata Kiri di Semua Layar */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-textPrimary">Prediksi Kesehatan</h1>
          <p className="text-sm text-textSecondary mt-1">Analisis cerdas dari data pemeriksaan Anda</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <PredictionCard
            title="Prediksi Risiko"
            description="Menggunakan data pemeriksaan Anda untuk mengidentifikasi potensi risiko diabetes."
            icon={FaHeartbeat}
            onClick={goToRisk}
            isPrimary={true}
            visual={RiskGauge}
          />
          <PredictionCard
            title="Prediksi Tren"
            description="Menganalisis pola data historis untuk memproyeksikan kadar gula darah masa depan."
            icon={FaChartLine}
            onClick={goToTrend}
            isPrimary={false}
            visual={TrendChart}
          />
        </div>

        {/* Catatan – Konsisten */}
        <div className="p-5 bg-blue-50/50 rounded-xl border border-lineGray">
          <p className="text-xs text-textSecondary leading-relaxed">
            <strong className="text-textPrimary">Catatan:</strong> Hasil prediksi bersifat informasional. Selalu
            konsultasikan dengan dokter untuk keputusan medis.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
