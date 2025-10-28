import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosConfig'; // pakai apiClient

export default function TambahPasien() {
  const navigate = useNavigate();
  const [newUser, setNewUser] = useState({
    name: '',
    age: '',
    email: '',
    gender: 'Laki-laki',
    address: '',
    password: '',
    role: 'pasien',
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addUser = async (e) => {
    e.preventDefault();
    setError('');

    if (!newUser.password) {
      setError('Password tidak boleh kosong.');
      alert('Password tidak boleh kosong.');
      return;
    }
    if (newUser.password.length < 6) {
      setError('Password minimal harus 6 karakter.');
      alert('Password minimal harus 6 karakter.');
      return;
    }

    try {
      const payload = {
        ...newUser,
        age: newUser.age ? parseInt(newUser.age, 10) : null,
        role: 'patient',
      };

      await apiClient.post('/users', payload);
      alert('Pasien berhasil ditambahkan!');
      navigate('/admin/monitoring');
    } catch (err) {
      console.error('Gagal tambah pasien:', err.response ? err.response.data : err.message);
      const errorMessage =
        err.response?.data?.message || 'Gagal menambahkan pasien. Silakan coba lagi.';
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">Tambah Pasien Baru</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
              {error}
            </div>
          )}

          <form onSubmit={addUser}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={newUser.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-600 mb-1">
                  Umur
                </label>
                <input
                  type="number"
                  name="age"
                  id="age"
                  value={newUser.age}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={newUser.password}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-600 mb-1">
                  Jenis Kelamin
                </label>
                <select
                  name="gender"
                  id="gender"
                  value={newUser.gender}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-600 mb-1">
                  Alamat
                </label>
                <textarea
                  name="address"
                  id="address"
                  value={newUser.address}
                  onChange={handleInputChange}
                  rows={3}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Tambah Pasien
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
