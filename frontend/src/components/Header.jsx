import React from 'react';

const Header = () => {
  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
      <div className="flex items-center px-4 py-3">

        {/* === BRAND: Logo + Teks (Kiri, Tanpa Ruang Kosong) === */}
        <div className="flex items-center space-x-2.5">
          {/* Logo */}
          <img
            src="/Glucosense.png"
            alt="Glucosense"
            className="h-9 w-9 object-contain"
          />

          {/* Teks – Warna dari logo: Biru Tua + Merah Coral */}
          <h1 className="text-xl font-bold">
            <span className="text-primaryBlue">Gluco</span>
            <span className="text-primaryRed">sense</span>
          </h1>
        </div>

      </div>
    </header>
  );
};

export default Header;