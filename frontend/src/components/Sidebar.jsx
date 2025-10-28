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
    <div className="w-64 bg-[#97A2C4] text-white p-6 flex flex-col justify-between min-h-screen">
      <div>
        <div className="mb-10">
          <img
            src="/Glucosense.png"
            alt="Logo"
            className="h-16 mx-auto mb-2"
          />
          <h1 className="text-center font-bold text-2xl">Glucosesense</h1>
        </div>
        <nav className="space-y-4">
          <MenuItem
            to="/admin/dashboard"
            icon={<FaHome />}
            text="Dashboard"
            active={location.pathname === '/admin/dashboard'}
          />
          <MenuItem
            to="/admin/monitoring"
            icon={<FaUser />}
            text="Monitoring"
            active={location.pathname === '/admin/monitoring'}
          />
          <MenuItem
            to="/admin/data-pasien"
            icon={<FaClipboardList />}
            text="Data Pasien"
            active={location.pathname === '/admin/data-pasien'}
          />
          <MenuItem
            to="/admin/data-pemeriksaan"
            icon={<FaClipboardList />}
            text="Data Pemeriksaan"
            active={location.pathname === '/admin/data-pemeriksaan'}
          />
          <MenuItem
            to="/admin/faq"
            icon={<FaQuestionCircle />}
            text="FAQ"
            active={location.pathname === '/admin/faq'}
          />
        </nav>
      </div>
      <div>
        <MenuItem
          to="/admin/setting"
          icon={<FaCog />}
          text="Setting"
          active={location.pathname === '/admin/setting'}
        />
      </div>
    </div>
  );
};

const MenuItem = ({ to, icon, text, active }) => {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-4 py-2 rounded transition ${
        active
          ? 'bg-white text-[#97A2C4] font-bold'
          : 'hover:bg-[#8b96bd] text-white'
      }`}
    >
      <div>{icon}</div>
      <div>{text}</div>
    </Link>
  );
};

export default Sidebar;
