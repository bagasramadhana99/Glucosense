import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Tentukan halaman "home" berdasarkan role
  const getHomePath = () => {
    if (location.pathname.startsWith('/admin')) return '/admin/dashboard';
    if (location.pathname.startsWith('/pasien')) return '/pasien/home';
    return '/';
  };

  const handleBrandClick = () => {
    navigate(getHomePath(), { replace: true });
  };

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-lineGray shadow-sm">
      <div className="flex items-center px-5 py-3.5">

        {/* === BRAND: Logo + Teks (Klikable ke Home sesuai role) === */}
        <div
          onClick={handleBrandClick}
          className="flex items-center space-x-2.5 cursor-pointer group transition-all duration-200 hover:scale-[1.02] select-none"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleBrandClick();
            }
          }}
          aria-label="Kembali ke Beranda"
        >
          {/* Logo */}
          <img
            src="/Glucosense.png"
            alt="Glucosense"
            className="h-10 w-10 object-contain transition-transform duration-200 group-hover:scale-110"
          />

          {/* Teks */}
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-primaryBlue transition-colors group-hover:text-primaryBlue/90">Gluco</span>
            <span className="text-primaryRed transition-colors group-hover:text-primaryRed/90">sense</span>
          </h1>
        </div>

      </div>
    </header>
  );
};

export default Header;