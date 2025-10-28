import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { FaCheckCircle, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';

export default function ResultPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    // Ambil data hasil dari state navigasi
    const result = location.state?.result;

    useEffect(() => {
        if (!result) {
            // Jika pengguna mencoba mengakses halaman ini secara langsung tanpa data,
            // arahkan kembali ke halaman prediksi.
            navigate('/pasien/prediksi');
        } else {
            // Tampilkan kartu dengan animasi fade-in
            const timer = setTimeout(() => setIsVisible(true), 100);
            return () => clearTimeout(timer);
        }
    }, [result, navigate]);

    if (!result) {
        return null; // Tampilkan blank screen selama proses redirect
    }

    const isHighRisk = result.result === "Risiko Tinggi";

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <Header />
            <main className="p-4 pb-28 flex flex-col justify-center items-center" style={{ minHeight: 'calc(100vh - 128px)' }}>
                
                {/* Tombol Kembali */}
                <button 
                    onClick={() => navigate(-1)} // Kembali ke halaman sebelumnya
                    className="absolute top-20 left-4 text-gray-600 hover:text-indigo-600 flex items-center"
                >
                    <FaArrowLeft className="mr-2" /> Kembali
                </button>

                {/* Kartu Hasil dengan Animasi */}
                <div 
                    className={`bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl text-center transform transition-all duration-500 ease-out ${
                        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                >
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
                            <strong>Peringatan:</strong> Hasil ini adalah prediksi berdasarkan model dan tidak menggantikan diagnosis medis profesional. Konsultasikan dengan dokter untuk diagnosis yang akurat.
                        </p>
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