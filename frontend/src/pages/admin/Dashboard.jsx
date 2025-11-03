import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import apiClient from '../../api/axiosConfig';
import { FaUsers, FaChevronLeft, FaChevronRight, FaChartBar } from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// === StatCard: Ikon lebih relevan, teks umum ===
function StatCard({ title, value, loading }) {
  if (loading) {
    return (
      <div className="bg-cardWhite p-5 rounded-xl shadow-sm border border-lineGray h-full flex items-center space-x-4 animate-pulse">
        <div className="w-11 h-11 bg-gray-200 rounded-lg" />
        <div className="flex-1">
          <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-8 bg-gray-200 rounded w-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cardWhite p-5 rounded-xl shadow-sm border border-lineGray h-full flex items-center space-x-4 hover:shadow-md transition-shadow duration-200">
      <div className="p-3 rounded-lg bg-primaryBlue/10 flex-shrink-0">
        <FaUsers className="text-xl text-primaryBlue" />
      </div>
      <div>
        <p className="text-sm font-medium text-textSecondary">{title}</p>
        <p className="text-3xl font-bold text-textPrimary mt-1">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

// === Calendar: Lebih rapi, hari ini dengan border & bold ===
function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Senin mulai

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const today = new Date();
  const isToday = (day) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  return (
    <div className="bg-cardWhite p-4 rounded-xl shadow-sm border border-lineGray h-full text-xs">
      <div className="flex justify-between items-center mb-3">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 rounded-lg hover:bg-neutralBg transition-colors text-textSecondary hover:text-primaryBlue"
          aria-label="Bulan sebelumnya"
        >
          <FaChevronLeft size={14} />
        </button>
        <h3 className="text-sm font-semibold text-textPrimary">
          {monthNames[currentMonth]}{' '}
          <span className="font-normal text-textSecondary">{currentYear}</span>
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-1.5 rounded-lg hover:bg-neutralBg transition-colors text-textSecondary hover:text-primaryBlue"
          aria-label="Bulan berikutnya"
        >
          <FaChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px text-center font-semibold text-textSecondary text-xs mb-1">
        {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px text-center text-xs">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const today = isToday(day);

          return (
            <div
              key={day}
              className={`py-2 rounded-full transition-colors ${
                today
                  ? 'bg-primaryBlue text-white font-bold ring-2 ring-primaryBlue ring-offset-2'
                  : 'hover:bg-primaryBlue/10 text-textPrimary'
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// === Main Dashboard ===
export default function Dashboard() {
  const [patientData, setPatientData] = useState({ total: 0, monthly: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const { data: patients } = await apiClient.get('/patients');
        const totalPatients = patients.length;

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const monthlyCounts = {};

        patients.forEach((patient) => {
          if (patient.created_at) {
            const monthIndex = new Date(patient.created_at).getMonth();
            const monthName = monthNames[monthIndex];
            monthlyCounts[monthName] = (monthlyCounts[monthName] || 0) + 1;
          }
        });

        const chartData = monthNames.map((name) => ({
          name,
          value: monthlyCounts[name] || 0,
        }));

        setPatientData({ total: totalPatients, monthly: chartData });
      } catch (err) {
        console.error('Gagal mengambil data:', err);
        setError('Gagal memuat data pasien. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  return (
    <div className="flex h-screen bg-neutralBg font-sans">
      <Sidebar activePage="Dashboard" />

      <main className="flex-1 p-5 md:p-7 overflow-y-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-textPrimary">Dashboard</h1>
          <p className="text-sm text-textSecondary mt-1">
            Pantau statistik pendaftaran pasien secara real-time
          </p>
        </header>

        {/* Grid: StatCard (2/3) + Kalender (1/3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="md:col-span-2">
            {error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-xl h-full flex items-center justify-center text-sm font-medium">
                {error}
              </div>
            ) : (
              <StatCard title="Jumlah Pasien" value={patientData.total} loading={loading} />
            )}
          </div>
          <div className="md:col-span-1">
            <Calendar />
          </div>
        </div>

        {/* Grafik */}
        <section className="bg-cardWhite p-5 rounded-xl shadow-sm border border-lineGray">
          <h2 className="text-base font-semibold text-textPrimary mb-4 flex items-center gap-2">
            <FaChartBar className="text-primaryBlue" />
            Grafik Pendaftaran Pasien per Bulan
          </h2>

          <div className="h-72 md:h-80">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-sm text-textSecondary">Memuat grafik...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-sm text-errorRed">
                Data tidak tersedia
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={patientData.monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '0.5rem',
                      border: '1px solid #E5E7EB',
                      fontSize: '13px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    labelStyle={{ color: '#1F2937', fontWeight: '600' }}
                    formatter={(value) => [`${value} pasien`, 'Jumlah']}
                    cursor={{ fill: 'rgba(30, 58, 95, 0.05)' }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#1E3A5F"
                    barSize={28}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}