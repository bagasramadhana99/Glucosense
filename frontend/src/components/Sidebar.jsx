import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaUser,
  FaClipboardList,
  FaCog,
  FaQuestionCircle,
} from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-cardWhite text-textPrimary p-6 flex flex-col justify-between min-h-screen border-r border-lineGray shadow-sm">
      <div>
        {/* === LOGO & BRAND === */}
        <div className="mb-10 flex items-center justify-center space-x-2.5">
          <img
            src="/Glucosense.png"
            alt="Glucosense"
            className="h-9 w-9 object-contain"
          />
          <h1 className="text-xl font-bold">
            <span className="text-primaryBlue">Gluco</span>
            <span className="text-primaryRed">sense</span>
          </h1>
        </div>

        {/* === NAVIGASI === */}
        <nav className="space-y-1">
          <MenuItem
            to="/admin/dashboard"
            icon={<FaHome className="text-lg" />}
            text="Dashboard"
            active={location.pathname === '/admin/dashboard'}
          />
          <MenuItem
            to="/admin/monitoring"
            icon={<FaUser className="text-lg" />}
            text="Monitoring"
            active={location.pathname === '/admin/monitoring'}
          />
          <MenuItem
            to="/admin/data-pasien"
            icon={<FaClipboardList className="text-lg" />}
            text="Data Pasien"
            active={location.pathname === '/admin/data-pasien'}
          />
          <MenuItem
            to="/admin/data-pemeriksaan"
            icon={<FaClipboardList className="text-lg" />}
            text="Data Pemeriksaan"
            active={location.pathname === '/admin/data-pemeriksaan'}
          />
          <MenuItem
            to="/admin/faq"
            icon={<FaQuestionCircle className="text-lg" />}
            text="FAQ"
            active={location.pathname === '/admin/faq'}
          />
        </nav>
      </div>

      {/* === SETTING (Bawah) === */}
      <div className="pt-6 border-t border-lineGray mt-6">
        <MenuItem
          to="/admin/setting"
          icon={<FaCog className="text-lg" />}
          text="Setting"
          active={location.pathname === '/admin/setting'}
        />
      </div>
    </div>
  );
};

// === KOMPONEN MENU ITEM ===
const MenuItem = ({ to, icon, text, active }) => {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium ${
        active
          ? 'bg-primaryBlue text-white shadow-sm'
          : 'text-textSecondary hover:bg-neutralBg hover:text-textPrimary'
      }`}
    >
      <div className={active ? 'text-white' : ''}>{icon}</div>
      <span>{text}</span>
    </Link>
  );
};

export default Sidebar;