import React, { useState, useEffect, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosConfig';
import {
  FaChevronDown,
  FaLightbulb,
  FaHeartbeat,
  FaCalendarAlt,
  FaChartLine,
  FaStethoscope,
} from 'react-icons/fa';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';

// =========================
// Skeleton
// =========================
const SkeletonCard = () => (
  <div className="bg-cardWhite p-6 rounded-2xl border border-lineGray animate-pulse">
    <div className="h-5 bg-gray-200 rounded w-36 mb-4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-4/5"></div>
    </div>
  </div>
);

// =========================
// Latest Checkup
// =========================
const LatestCheckup = memo(({ checkup, onViewHistory }) => {
  const date = new Date(checkup.timestamp);
  const formatted = date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const time = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-cardWhite p-6 rounded-2xl border border-lineGray">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-textPrimary flex items-center">
          <FaHeartbeat className="text-primaryRed mr-2" />
          Pemeriksaan Terakhir
        </h3>
        <button
          onClick={onViewHistory}
          className="text-sm text-softBlue hover:underline font-medium"
        >
          Lihat Semua
        </button>
      </div>
      <p className="text-sm text-textSecondary flex items-center mb-4">
        <FaCalendarAlt className="mr-1.5 text-xs" />
        {formatted} • {time} WIB
      </p>
      <div className="grid grid-cols-2 gap-6 text-center">
        <div>
          <p className="text-xs text-textSecondary mb-1">Glukosa</p>
          <p className="text-2xl font-bold text-textPrimary">
            {checkup.glucose_level}
            <span className="text-sm font-normal text-textSecondary ml-1">mg/dL</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-textSecondary mb-1">Detak Jantung</p>
          <p className="text-2xl font-bold text-textPrimary">
            {checkup.heart_rate}
            <span className="text-sm font-normal text-textSecondary ml-1">bpm</span>
          </p>
        </div>
      </div>
    </div>
  );
});

// =========================
// Health Stats
// =========================
const HealthStats = memo(({ riwayat }) => {
  const stats = useMemo(() => {
    if (!riwayat.length) return null;
    const g = riwayat.map(r => r.glucose_level);
    return {
      total: riwayat.length,
      avg: Math.round(g.reduce((a, b) => a + b, 0) / g.length),
      min: Math.min(...g),
      max: Math.max(...g),
    };
  }, [riwayat]);

  if (!stats) return null;

  return (
    <div className="bg-cardWhite p-5 rounded-2xl border border-lineGray">
      <h3 className="text-base font-semibold text-textPrimary mb-3 flex items-center">
        <FaChartLine className="text-primaryBlue mr-2 text-sm" />
        Ringkasan
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-textSecondary">Total</span>
          <span className="font-medium">{stats.total} kali</span>
        </div>
        <div className="pt-2 border-t border-lineGray text-xs">
          <div className="grid grid-cols-3 gap-3 text-center mt-2">
            <div>
              <p className="text-textSecondary">Rata²</p>
              <p className="font-semibold">{stats.avg}</p>
            </div>
            <div>
              <p className="text-successGreen">Min</p>
              <p className="font-semibold text-successGreen">{stats.min}</p>
            </div>
            <div>
              <p className="text-errorRed">Max</p>
              <p className="font-semibold text-errorRed">{stats.max}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// =========================
// Mini Trend Chart
// =========================
const MiniTrendChart = memo(({ riwayat }) => {
  const last7Days = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    return riwayat
      .filter(r => new Date(r.timestamp) >= sevenDaysAgo)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-7);
  }, [riwayat]);

  if (last7Days.length < 2) return null;

  const values = last7Days.map(r => r.glucose_level);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return (
    <div className="bg-cardWhite p-5 rounded-2xl border border-lineGray">
      <h3 className="text-base font-semibold text-textPrimary mb-3 flex items-center">
        <FaChartLine className="text-primaryBlue mr-2 text-sm" />
        Tren 7 Hari
      </h3>
      <div className="h-20">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            points={last7Days
              .map((r, i) => {
                const x = (i / (last7Days.length - 1)) * 100;
                const y = 80 - ((r.glucose_level - min) / range) * 60;
                return `${x},${y}`;
              })
              .join(' ')}
          />
          {last7Days.map((r, i) => {
            const x = (i / (last7Days.length - 1)) * 100;
            const y = 80 - ((r.glucose_level - min) / range) * 60;
            return <circle key={i} cx={x} cy={y} r="3" fill="#3b82f6" />;
          })}
        </svg>
      </div>
      <div className="flex justify-between text-xs text-textSecondary mt-1">
        <span>{values[0]}</span>
        <span>{values[values.length - 1]}</span>
      </div>
    </div>
  );
});

// =========================
// Fun Fact Item
// =========================
const FunFactItem = memo(({ fact, isOpen, onToggle }) => (
  <div className="bg-cardWhite rounded-2xl border border-lineGray overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex justify-between items-center p-4 text-left focus:outline-none focus:bg-neutralBg/30 transition-colors"
    >
      <div className="flex items-center flex-1">
        <FaLightbulb className="text-yellow-500 mr-2 text-sm" />
        <h4 className="text-sm font-medium text-textPrimary">{fact.judul}</h4>
      </div>
      <FaChevronDown className={`text-softBlue text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <div className={`overflow-hidden transition-all ${isOpen ? 'max-h-40' : 'max-h-0'}`}>
      <p className="px-4 pb-4 pt-1 text-xs text-textSecondary leading-relaxed">{fact.deskripsi}</p>
    </div>
  </div>
));

// =========================
// Empty State
// =========================
const EmptyCheckup = memo(({ onStartCheckup }) => (
  <div className="bg-cardWhite p-8 rounded-2xl border border-lineGray text-center">
    <div className="w-16 h-16 mx-auto bg-primaryBlue/10 rounded-full flex items-center justify-center mb-4">
      <FaStethoscope className="text-primaryBlue text-2xl" />
    </div>
    <h3 className="text-lg font-semibold text-textPrimary mb-1">Belum Ada Data</h3>
    <p className="text-sm text-textSecondary mb-4">Mulai pemeriksaan untuk melihat hasil glukosa Anda.</p>
    <button
      onClick={onStartCheckup}
      className="text-sm font-medium text-primaryBlue hover:text-softBlue transition"
    >
      Mulai Pemeriksaan
    </button>
  </div>
));

// =========================
// Main Component
// =========================
export default function PasienHome() {
  const [riwayat, setRiwayat] = useState([]);
  const [facts, setFacts] = useState([]);
  const [loadingCheckup, setLoadingCheckup] = useState(true);
  const [loadingFacts, setLoadingFacts] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  // Fetch Riwayat
  useEffect(() => {
    const fetchRiwayat = async () => {
      try {
        const { data } = await apiClient.get('/monitoring/me');
        const sorted = (data || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setRiwayat(sorted);
      } catch (err) {
        console.error('Gagal fetch riwayat:', err);
      } finally {
        setLoadingCheckup(false);
      }
    };
    fetchRiwayat();
  }, []);

  // Fetch Facts
  useEffect(() => {
    const fetchFacts = async () => {
      try {
        const { data } = await apiClient.get('/faq');
        setFacts(data || []);
      } catch (err) {
        console.error('Gagal fetch facts:', err);
      } finally {
        setLoadingFacts(false);
      }
    };
    fetchFacts();
  }, []);

  const latestCheckup = riwayat[0] || null;
  const toggleAccordion = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="bg-neutralBg min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-6 pb-24 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full">
        {/* Greeting */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-textPrimary">Beranda</h1>
          <p className="text-textSecondary text-sm mt-1">
            Halo, <span className="font-medium text-primaryBlue">{user?.name || 'Pasien'}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Checkup + Stats + Chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Latest Checkup */}
            {loadingCheckup ? (
              <SkeletonCard />
            ) : latestCheckup ? (
              <LatestCheckup checkup={latestCheckup} onViewHistory={() => navigate('/pasien/riwayat')} />
            ) : (
              <EmptyCheckup onStartCheckup={() => navigate('/pasien/pemeriksaan')} />
            )}

            {/* Stats + Chart */}
            {riwayat.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <HealthStats riwayat={riwayat} />
                <MiniTrendChart riwayat={riwayat} />
              </div>
            )}
          </div>

          {/* Right: Fun Facts */}
          <div>
            <h2 className="text-lg font-semibold text-textPrimary mb-3 flex items-center">
              <FaLightbulb className="text-yellow-500 mr-2 text-sm" />
              Fun Facts
            </h2>
            <div className="space-y-3">
              {loadingFacts ? (
                [...Array(2)].map((_, i) => <SkeletonCard key={i} />)
              ) : facts.length > 0 ? (
                facts.map((fact, i) => (
                  <FunFactItem
                    key={fact.id}
                    fact={fact}
                    isOpen={openIndex === i}
                    onToggle={() => toggleAccordion(i)}
                  />
                ))
              ) : (
                <p className="text-center text-textSecondary text-xs py-6 bg-cardWhite rounded-2xl border border-lineGray">
                  Tidak ada fakta.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}