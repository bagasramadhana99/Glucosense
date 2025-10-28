import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import apiClient from '../../api/axiosConfig';
import { FaUser, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Kartu statistik (tidak diubah)
function StatCard({ title, value }) {
  return (
    <div className="bg-[#AAB9D5] p-5 md:p-6 rounded-xl shadow-lg text-white flex items-center space-x-4 h-full">
      <div className="p-3 rounded-full bg-white bg-opacity-30">
        <FaUser className="text-3xl text-white" />
      </div>
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-3xl font-bold">{value}</div>
      </div>
    </div>
  );
}

// Komponen Kalender (tidak diubah)
function Calendar() {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
  
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
    const handlePrevMonth = () => {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((prev) => prev - 1);
      } else {
        setCurrentMonth((prev) => prev - 1);
      }
    };
  
    const handleNextMonth = () => {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((prev) => prev + 1);
      } else {
        setCurrentMonth((prev) => prev + 1);
      }
    };
  
    return (
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg h-full">
        <div className="flex justify-between items-center mb-4">
          <button onClick={handlePrevMonth} className="text-gray-600 hover:text-indigo-600 p-1 rounded-full hover:bg-gray-100">
            <FaChevronLeft size={18} />
          </button>
          <h2 className="text-md font-semibold text-gray-700">
            {monthNames[currentMonth]} <span className="text-gray-500">{currentYear}</span>
          </h2>
          <button onClick={handleNextMonth} className="text-gray-600 hover:text-indigo-600 p-1 rounded-full hover:bg-gray-100">
            <FaChevronRight size={18} />
          </button>
        </div>
  
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-700">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} className="font-medium text-gray-500 py-1">{d}</div>
          ))}
          {Array.from({ length: (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1) }).map((_, i) => (
            <div key={`empty-${i}`}></div>
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const isToday =
              day === new Date().getDate() &&
              currentMonth === new Date().getMonth() &&
              currentYear === new Date().getFullYear();
  
            return (
              <div
                key={day}
                className={`py-1.5 rounded-full ${
                  isToday ? 'bg-indigo-500 text-white font-semibold' : 'hover:bg-indigo-100'
                } cursor-pointer`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

// Komponen utama
export default function Dashboard() {
    const [patientData, setPatientData] = useState({ total: 0, monthly: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                const response = await apiClient.get('/patients');
                const patients = response.data;
                const totalPatients = patients.length;
                const monthlyCounts = {};
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                
                patients.forEach(patient => {
                    if (patient.created_at) { 
                        const registrationDate = new Date(patient.created_at);
                        const monthIndex = registrationDate.getMonth();
                        const monthName = monthNames[monthIndex];
                        monthlyCounts[monthName] = (monthlyCounts[monthName] || 0) + 1;
                    }
                });

                const chartData = monthNames.map(name => ({
                    name: name,
                    value: monthlyCounts[name] || 0
                }));

                setPatientData({ total: totalPatients, monthly: chartData });

            } catch (err) {
                console.error("Gagal mengambil data pasien:", err);
                setError("Tidak dapat memuat data pasien.");
            } finally {
                setLoading(false);
            }
        };

        fetchPatientData();
    }, []);


  return (
    <div className="flex h-screen font-sans">
      <Sidebar activePage="Dashboard" />

      <div className="flex-1 bg-[#F0F2F9] p-6 md:p-8 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex justify-end items-center mb-8">
        </div>

        {/* ========================================================== */}
        {/* ▼▼▼ FOKUS PERUBAHAN TATA LETAK ADA DI SINI ▼▼▼ */}
        {/* ========================================================== */}

        {/* Baris Atas: Diubah menjadi 3 kolom di layar besar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Kartu Statistik memakan 2 kolom */}
            <div className="lg:col-span-2">
                {loading ? (
                    <div className="bg-gray-300 p-6 rounded-xl animate-pulse h-full min-h-[124px]"></div>
                ) : error ? (
                    <div className="bg-red-100 text-red-700 p-6 rounded-xl h-full">{error}</div>
                ) : (
                    <StatCard title="Total Pasien" value={patientData.total} />
                )}
            </div>

            {/* Kalender memakan 1 kolom, jadi terlihat lebih kecil/ramping */}
            <div className="lg:col-span-1">
                <Calendar />
            </div>
        </div>


        {/* Baris Bawah: Grafik (Tingginya ditambah) */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Grafik Pendaftaran Pasien</h2>
          </div>
          {/* Tinggi grafik diubah dari 320px menjadi 400px */}
          <div style={{ height: '400px' }}>
            {loading ? (
               <div className="flex items-center justify-center h-full">
                    <p className="text-center text-gray-500">Memuat data grafik...</p>
               </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={patientData.monthly} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <Tooltip
                      contentStyle={{
                      backgroundColor: 'white',
                      borderRadius: '0.5rem',
                      borderColor: '#e5e7eb',
                      }}
                      itemStyle={{ color: '#4b5563' }}
                      cursor={{ fill: 'rgba(230, 230, 250, 0.4)' }}
                  />
                  <Bar dataKey="value" name="Pasien Baru" fill="#AAB9D5" barSize={20} radius={[4, 4, 0, 0]} />
                  </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto text-center text-sm text-gray-500 py-6 pt-8">
          copyright © Glucosense 2025
        </footer>
      </div>
    </div>
  );
}