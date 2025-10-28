import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import MainLayout from './components/MainLayout.jsx';
import HomePage from './pages/pasien/HomePage.jsx';
import RiwayatPage from './pages/pasien/RiwayatPage.jsx';
import ProfilPage from './pages/pasien/ProfilPage.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import Monitoring from './pages/admin/Monitoring.jsx';
import DataPasien from './pages/admin/DataPasien.jsx';
import DataPemeriksaan from './pages/admin/DataPemeriksaan.jsx';
import Faq from './pages/admin/Faq.jsx';
import Setting from './pages/admin/Setting.jsx';
import TambahPasien from './pages/admin/TambahPasien.jsx';
import EditPasien from './pages/admin/EditPasien.jsx';

// --- FOKUS PERUBAHAN ---
// 1. Impor halaman-halaman prediksi yang baru dan sudah diubah namanya
import ChoosePredictionPage from './pages/pasien/ChoosePredictionPage.jsx'; // Halaman pilihan
import RiskPredictionPage from './pages/pasien/RiskPredictionPage.jsx';   // Halaman form risiko
import ResultPage from './pages/pasien/ResultPage.jsx';                   // Halaman hasil
import GlucoseTrendPage from './pages/pasien/GlucoseTrendPage.jsx';       // Halaman tren glukosa
import TrendResultPage from './pages/pasien/TrendResultPage.jsx'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Rute untuk Pasien */}
        <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
          <Route element={<MainLayout />}>
            <Route path="/pasien/home" element={<HomePage />} />
            <Route path="/pasien/riwayat" element={<RiwayatPage />} />
            
            {/* --- FOKUS PERUBAHAN --- */}
            {/* 2. Sesuaikan rute prediksi */}
            <Route path="/pasien/prediksi" element={<ChoosePredictionPage />} />
            <Route path="/pasien/prediksi-risiko" element={<RiskPredictionPage />} />
            <Route path="/pasien/hasil-prediksi" element={<ResultPage />} />
            <Route path="/pasien/prediksi-tren" element={<GlucoseTrendPage />} />
            <Route path="/pasien/hasil-tren" element={<TrendResultPage />} />
            <Route path="/pasien/profil" element={<ProfilPage />} />
            <Route path="/pasien" element={<Navigate to="/pasien/home" replace />} />
          </Route>
        </Route>

        {/* Rute untuk Admin */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/monitoring" element={<Monitoring />} />
          <Route path="/admin/data-pasien" element={<DataPasien />} />
          <Route path="/admin/data-pemeriksaan" element={<DataPemeriksaan />} />
          <Route path="/admin/faq" element={<Faq />} />
          <Route path="/admin/setting" element={<Setting />} />
          <Route path="/admin/tambah-pasien" element={<TambahPasien />} />
          <Route path="/admin/edit-pasien/:id" element={<EditPasien />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;