import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProfilPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user')); // ✅ sessionStorage

  const handleLogout = () => {
    sessionStorage.removeItem('token'); // ✅ hapus dari session
    sessionStorage.removeItem('user');
    navigate('/login'); // ✅ arahkan ke route login universal
  };

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-4">Profil Saya</h1>
      {user ? (
        <div className="bg-white p-4 rounded-lg shadow space-y-3">
          <div>
            <label className="text-sm text-gray-500">Nama</label>
            <p className="font-semibold text-lg">{user.name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <p className="font-semibold text-lg">{user.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Role</label>
            <p className="font-semibold text-lg capitalize">{user.role}</p>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Data user tidak ditemukan.</p>
      )}
      <button
        onClick={handleLogout}
        className="w-full mt-6 bg-red-500 text-white p-3 rounded-lg hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default ProfilPage;
