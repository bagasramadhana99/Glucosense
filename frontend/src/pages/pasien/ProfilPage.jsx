import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfilPage = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const user = JSON.parse(sessionStorage.getItem('user'));

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  const confirmLogout = () => {
    setShowLogoutModal(true);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="min-h-screen bg-neutralBg p-4 pb-24">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-primaryBlue">Profil Saya</h1>
        
        {user ? (
          <div className="bg-cardWhite p-6 rounded-xl shadow-md space-y-4">
            <div className="pb-4 border-b border-lineGray">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-softBlue flex items-center justify-center text-white text-xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-textPrimary">{user.name}</h2>
                  <p className="text-sm text-textSecondary capitalize">{user.role}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <label className="text-sm text-textSecondary">Nama</label>
                <p className="font-medium text-textPrimary">{user.name}</p>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <label className="text-sm text-textSecondary">Email</label>
                <p className="font-medium text-textPrimary text-sm">{user.email}</p>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <label className="text-sm text-textSecondary">Role</label>
                <span className="px-3 py-1 bg-softBlue text-white text-xs rounded-full capitalize">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-cardWhite p-6 rounded-xl shadow-md text-center">
            <p className="text-textSecondary">Data user tidak ditemukan.</p>
          </div>
        )}
        
        <button
          onClick={confirmLogout}
          className="w-full mt-6 bg-primaryRed text-white py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-200 font-medium"
        >
          Logout
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-cardWhite rounded-xl p-6 max-w-sm mx-4 shadow-xl">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-errorRed" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-textPrimary text-center mb-2">Konfirmasi Logout</h3>
            <p className="text-textSecondary text-center mb-6">Apakah Anda yakin ingin keluar dari akun?</p>
            <div className="flex space-x-3">
              <button
                onClick={cancelLogout}
                className="flex-1 py-2 px-4 bg-lineGray text-textPrimary rounded-lg hover:bg-opacity-80 transition-all duration-200"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2 px-4 bg-primaryRed text-white rounded-lg hover:bg-opacity-90 transition-all duration-200"
              >
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilPage;