import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosConfig';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';

const RiwayatPage = () => {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Logic untuk mengambil data user (tidak diubah)
  useEffect(() => {
    try {
      const userData = JSON.parse(sessionStorage.getItem('user'));
      if (!userData) {
        navigate('/login');
      } else {
        setUser(userData);
      }
    } catch (e) {
      console.error("Failed to parse user from sessionStorage", e);
      navigate('/login');
    }
  }, [navigate]);

  // [PERBAIKAN] Logic untuk mengambil riwayat dengan metode Polling
  useEffect(() => {
    if (!user) return; // Jangan jalankan apapun jika user belum ada

    const fetchRiwayat = async () => {
      // Tidak perlu setLoading(true) di sini agar layar tidak berkedip setiap kali data diperbarui
      try {
        const response = await apiClient.get('/monitoring/me');
        setRiwayat(response.data);
      } catch (err) {
        // Hanya set error jika belum pernah ada error sebelumnya
        if (!error) {
          setError('Gagal memperbarui riwayat pemeriksaan.');
        }
        console.error(err);
      } finally {
        // Pastikan loading di-set false hanya pada pemanggilan pertama
        if (loading) {
          setLoading(false);
        }
      }
    };

    // 1. Ambil data pertama kali saat komponen dimuat
    fetchRiwayat();

    // 2. Atur interval untuk mengambil data kembali setiap 5 detik (5000 ms)
    const intervalId = setInterval(fetchRiwayat, 5000);

    // 3. Fungsi cleanup: Hentikan interval saat halaman ditutup
    // Ini sangat penting untuk mencegah kebocoran memori (memory leak)
    return () => clearInterval(intervalId);

  }, [user, loading, error]); // Dependency array

  const renderContent = () => {
    if (loading) {
      return <p className="text-center text-gray-500 mt-8">Memuat riwayat...</p>;
    }
    if (error && riwayat.length === 0) {
      return <p className="text-center text-red-500 mt-8">{error}</p>;
    }
    if (riwayat.length === 0) {
      return <p className="text-center text-gray-500 mt-8">Belum ada data riwayat pemeriksaan.</p>;
    }
    return (
      <div className="space-y-4">
        {riwayat.map((item) => (
          <div key={item.id} className="p-5 bg-white rounded-2xl shadow-md border border-gray-200">
            <p className="font-semibold text-base text-gray-800 mb-3">
              {new Date(item.timestamp).toLocaleDateString('id-ID', {
                timeZone: 'UTC', // <-- TAMBAHKAN BARIS INI
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <div className="flex justify-between items-center text-gray-700">
              <div>
                <span className="text-sm">Glukosa:</span>
                <p className="font-bold text-xl">{item.glucose_level} <span className="text-sm font-normal">mg/dL</span></p>
              </div>
              <div className="text-right">
                <span className="text-sm">Detak Jantung:</span>
                <p className="font-bold text-xl">{item.heart_rate} <span className="text-sm font-normal">bpm</span></p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="p-4 pb-24"> {/* Padding bawah agar tidak tertutup nav */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Riwayat Pemeriksaan</h2>
        {renderContent()}
      </main>
      <BottomNav />
    </div>
  );
};

export default RiwayatPage;