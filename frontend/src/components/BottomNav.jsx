import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaHistory, FaUserAlt, FaStethoscope } from "react-icons/fa";

const BottomNavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center pt-2 pb-1 w-1/4 text-xs transition-colors duration-200 
      ${isActive ? "text-primaryBlue font-semibold" : "text-textSecondary"} hover:text-primaryBlue relative`
    }
  >
    {icon}
    <span className="mt-1">{label}</span>
    {/* Indicator */}
    {({ isActive }) =>
      isActive && (
        <span className="absolute -top-1 h-1 w-full rounded-full bg-primaryBlue" />
      )
    }
  </NavLink>
);

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-cardWhite shadow-[0_-2px_10px_-5px_rgba(0,0,0,0.1)] z-50 h-16 border-t border-lineGray">
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        <BottomNavItem to="/pasien/home" icon={<FaHome size={22} />} label="Beranda" />
        <BottomNavItem to="/pasien/riwayat" icon={<FaHistory size={22} />} label="Riwayat" />
        <BottomNavItem to="/pasien/prediksi" icon={<FaStethoscope size={22} />} label="Prediksi" />
        <BottomNavItem to="/pasien/profil" icon={<FaUserAlt size={20} />} label="Profil" />
      </div>
    </nav>
  );
};

export default BottomNav;
