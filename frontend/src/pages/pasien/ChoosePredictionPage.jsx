import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { FaArrowRight } from 'react-icons/fa';

// --- KOMPONEN UNTUK VISUALISASI ---

const MiniTrendChart = () => (
    <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="xMidYMid meet">
        <path d="M 0 40 Q 15 10, 30 30 T 60 20 T 90 35 L 100 30" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
);

const MiniRiskCircle = () => (
    <svg className="w-full h-full" viewBox="0 0 36 36">
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3.5" />
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" strokeDasharray="75, 100" strokeLinecap="round" transform="rotate(-90 18 18)" />
        <text x="18" y="22" textAnchor="middle" fontSize="9px" fill="currentColor" fontWeight="bold">75%</text>
    </svg>
);

// --- Komponen Card ---
const PredictionOptionCard = ({ title, description, visual, onClick, gradient }) => (
    <button
        onClick={onClick}
        className={`relative p-6 rounded-2xl shadow-lg w-full text-left hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden text-white ${gradient}`}
    >
        <div className="flex justify-between items-center">
            {/* Bagian Kiri: Konten Teks */}
            <div className="flex-1 pr-4 z-10">
                <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
                <p className="mt-2 text-sm opacity-90 max-w-xs">{description}</p>
                <div className="mt-6 font-semibold flex items-center group text-sm">
                    Mulai
                    <FaArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
            </div>

            {/* Bagian Kanan: Visualisasi */}
            <div className="absolute -right-4 -bottom-4 w-32 h-32 text-white opacity-20">
                {visual}
            </div>
        </div>
    </button>
);

export default function ChoosePredictionPage() {
    const navigate = useNavigate();

    return (
        <div className="bg-gray-100 min-h-screen">
            <Header />
            <main className="p-4 pb-28">
                <h1 className="text-3xl font-bold mb-2 text-gray-800 tracking-tighter">Lakukan Prediksi</h1>
                <p className="text-gray-600 mb-8">Pilih jenis analisis kesehatan yang ingin Anda lakukan.</p>
                
                <div className="space-y-6">
                    {/* Card untuk Prediksi Risiko */}
                    <PredictionOptionCard 
                        title="Prediksi Risiko"
                        description="Ketahui estimasi risiko Anda terhadap diabetes untuk deteksi dini."
                        visual={<MiniRiskCircle />}
                        onClick={() => navigate('/pasien/prediksi-risiko')}
                        // --- WARNA DIUBAH MENJADI LEBIH TERANG (-400) ---
                        gradient="bg-gradient-to-br from-red-400 to-orange-400"
                    />

                    {/* Card untuk Prediksi Tren */}
                    <PredictionOptionCard 
                        title="Prediksi Tren"
                        description="Lihat proyeksi kadar gula darah Anda untuk 5 hari ke depan."
                        visual={<MiniTrendChart />}
                        onClick={() => navigate('/pasien/prediksi-tren')}
                        // --- WARNA DIUBAH MENJADI LEBIH TERANG (-400) ---
                        gradient="bg-gradient-to-br from-indigo-400 to-purple-400"
                    />
                </div>
            </main>
            <BottomNav />
        </div>
    );
}