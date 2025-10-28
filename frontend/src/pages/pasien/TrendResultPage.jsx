import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { FaChartLine, FaArrowLeft, FaCalendarDay } from 'react-icons/fa';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function TrendResultPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    const result = location.state?.result;

    useEffect(() => {
        if (!result) {
            navigate('/pasien/prediksi-tren');
        } else {
            const timer = setTimeout(() => setIsVisible(true), 100);
            return () => clearTimeout(timer);
        }
    }, [result, navigate]);

    const futureDates = useMemo(() => {
        const dates = [];
        const today = new Date();
        for (let i = 1; i <= 5; i++) {
            const nextDay = new Date(today);
            nextDay.setDate(today.getDate() + i);
            dates.push(nextDay);
        }
        return dates;
    }, []);

    const chartData = useMemo(() => {
        if (!result) return [];
        return result.predictions.map((value, index) => ({
            tanggalPendek: futureDates[index].toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short'
            }),
            'Prediksi Glukosa': value,
            tanggalLengkap: futureDates[index].toLocaleDateString('id-ID', {
                 weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })
        }));
    }, [result, futureDates]);

    const formatFullDate = (date) => {
        return date.toLocaleDateString('id-ID', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    if (!result) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <Header />
            <main className="p-4 pb-28">
                
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <FaChartLine className="mr-3 text-indigo-500" />
                        Hasil Prediksi Tren
                    </h1>
                    <button 
                        onClick={() => navigate('/pasien/prediksi')} 
                        className="text-sm text-gray-600 hover:text-indigo-600 flex items-center"
                    >
                        <FaArrowLeft className="mr-1" /> Kembali
                    </button>
                </div>
                
                <div 
                    className={`bg-white w-full max-w-4xl mx-auto p-6 rounded-3xl shadow-2xl transform transition-all duration-500 ease-out ${
                        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                >
                    <p className="text-center text-gray-600 mb-4">Berikut adalah prediksi tren kadar glukosa Anda untuk 5 hari ke depan, dimulai dari besok.</p>
                    
                    {/* Grafik */}
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="tanggalPendek" />
                                <YAxis domain={['auto', 'auto']} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '10px', boxShadow: '2px 2px 10px rgba(0,0,0,0.1)' }}
                                    labelFormatter={(label) => {
                                        const fullData = chartData.find(d => d.tanggalPendek === label);
                                        return fullData ? fullData.tanggalLengkap : label;
                                    }}
                                />
                                <Legend />
                                <Area 
                                    type="monotone" 
                                    dataKey="Prediksi Glukosa" 
                                    stroke="#4f46e5" 
                                    fill="url(#chartGradient)" 
                                    strokeWidth={3}
                                    dot={{ stroke: '#4f46e5', strokeWidth: 2, r: 5, fill: 'white' }}
                                    activeDot={{ r: 8, stroke: '#4f46e5', fill: '#c7d2fe' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Ringkasan Rata-rata */}
                    <div className="mt-6 p-4 bg-indigo-50 rounded-xl text-center">
                         <p className="text-lg font-semibold text-indigo-800">Rata-rata Prediksi (5 Hari)</p>
                         <p className="text-3xl font-bold text-indigo-600">{result.average_prediction} mg/dL</p>
                    </div>

                    {/* Detail Prediksi dengan Tanggal */}
                    <div className="mt-8">
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Rincian Prediksi per Hari</h3>
                        <div className="space-y-3">
                            {result.predictions.map((value, index) => (
                                <div key={index} className="flex flex-col sm:flex-row justify-between sm:items-center bg-gray-50 p-3 rounded-lg">
                                    <span className="font-medium text-gray-700 flex items-center mb-1 sm:mb-0">
                                        <FaCalendarDay className="mr-2 text-gray-500" /> 
                                        {formatFullDate(futureDates[index])}
                                    </span>
                                    <strong className="text-indigo-600 text-lg">{value} mg/dL</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- PENYESUAIAN TOMBOL DI SINI --- */}
                {/* 1. Bungkus tombol dengan div */}
                <div className="mt-8 flex justify-center"> 
                    <button
                        onClick={() => navigate('/pasien/prediksi-tren')}
                        // 2. Hapus w-full, biarkan lebar menyesuaikan konten atau set lebar spesifik (misal: w-auto, w-64)
                        className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-indigo-700 transition" 
                    >
                        Lakukan Prediksi Ulang
                    </button>
                </div>
                 {/* ------------------------------- */}

            </main>
            <BottomNav />
        </div>
    );
}