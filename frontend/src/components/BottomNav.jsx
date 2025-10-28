import React from 'react';
import { NavLink } from 'react-router-dom';
// Impor ikon baru
import { FaHome, FaHistory, FaUserAlt, FaStethoscope } from 'react-icons/fa';

const BottomNavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center pt-2 pb-1 w-1/4 text-xs transition-colors duration-200 ${
        isActive 
          ? 'text-indigo-600 font-semibold' 
          : 'text-gray-500'
      } hover:text-indigo-500`
    }
  >
    {icon}
    <span className="mt-1">{label}</span>
  </NavLink>
);

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_-5px_rgba(0,0,0,0.1)] z-50 h-16">
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        <BottomNavItem to="/pasien/home" icon={<FaHome size={22} />} label="Beranda" />
        <BottomNavItem to="/pasien/riwayat" icon={<FaHistory size={22} />} label="Riwayat" />
        {/* === ITEM BARU DITAMBAHKAN DI SINI === */}
        <BottomNavItem to="/pasien/prediksi" icon={<FaStethoscope size={22} />} label="Prediksi" />
        <BottomNavItem to="/pasien/profil" icon={<FaUserAlt size={20} />} label="Profil" />
      </div>
    </nav>
  );
};

export default BottomNav;