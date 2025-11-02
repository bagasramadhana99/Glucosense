import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';

const ProfilPage = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  const confirmLogout = () => setShowLogoutModal(true);
  const cancelLogout = () => setShowLogoutModal(false);
  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <div className="bg-neutralBg min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-6 pb-24 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-textPrimary">Profil Saya</h1>
          <p className="text-sm text-textSecondary mt-1">Informasi akun dan pengaturan</p>
        </div>

        {/* Profil Card */}
        <div className="bg-cardWhite p-6 rounded-2xl border border-lineGray">
          {user?.id ? (
            <>
              {/* Avatar + Nama */}
              <div className="flex items-center space-x-4 mb-6 pb-5 border-b border-lineGray">
                <div className="w-16 h-16 rounded-full bg-softBlue flex items-center justify-center text-white text-2xl font-bold shadow-sm">
                  {user.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-textPrimary">{user.name || 'Pengguna'}</h2>
                  <span className="inline-block px-3 py-1 bg-softBlue text-white text-xs font-medium rounded-full capitalize">
                    {user.role || 'pasien'}
                  </span>
                </div>
              </div>

              {/* Detail */}
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-textSecondary">Nama Lengkap</span>
                  <span className="font-medium text-textPrimary">{user.name || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-textSecondary">Email</span>
                  <span className="font-medium text-textPrimary text-right max-w-[60%] break-all">
                    {user.email || '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-textSecondary">Peran</span>
                  <span className="px-3 py-1 bg-softBlue text-white text-xs font-medium rounded-full capitalize">
                    {user.role || 'pasien'}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-textSecondary">Data profil tidak tersedia.</p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={confirmLogout}
          className="w-full mt-6 py-3 px-4 bg-primaryRed hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-all duration-200 shadow-sm hover:shadow"
        >
          Keluar dari Akun
        </button>
      </main>

      <BottomNav />

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-cardWhite p-6 rounded-2xl border border-lineGray max-w-sm w-full">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primaryRed" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-textPrimary text-center mb-2">Konfirmasi Logout</h3>
            <p className="text-sm text-textSecondary text-center mb-6">
              Apakah Anda yakin ingin keluar dari akun?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={cancelLogout}
                className="py-2.5 px-4 bg-lineGray hover:bg-gray-200 text-textPrimary rounded-lg font-medium text-sm transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="py-2.5 px-4 bg-primaryRed hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-all"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilPage;