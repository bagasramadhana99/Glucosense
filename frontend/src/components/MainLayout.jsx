import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

const MainLayout = () => {
  return (
    // Container inilah yang membatasi lebar dan menengahkan halaman
    <div className=" mx-auto bg-gray-50 min-h-screen shadow-lg relative">
      <div className="pb-24"> {/* Padding untuk navigasi bawah */}
        <Outlet /> {/* Merender halaman Riwayat atau Profil */}
      </div>
      <BottomNav />
    </div>
  );
};

export default MainLayout;