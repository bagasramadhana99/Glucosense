import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import apiClient from '../../api/axiosConfig'; // Ganti axios dengan instance

export default function EditPasien() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: '',
    age: '',
    email: '',
    gender: '',
    address: '',
    role: 'patient',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiClient.get(`/users/${id}`);
        setUser({
          name: res.data.name || '',
          age: res.data.age || '',
          email: res.data.email || '',
          gender: res.data.gender || '',
          address: res.data.address || '',
          role: res.data.role || 'patient',
        });
      } catch (err) {
        console.error('Gagal mengambil data user:', err);
        alert('Gagal mengambil data user yang akan diedit.');
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/users/${id}`, user);
      alert('Data pasien berhasil diperbarui');
      navigate('/admin/data-pasien'); // arahkan ke halaman admin yang sesuai
    } catch (err) {
      console.error('Gagal memperbarui data:', err);
      if (err.response?.status === 409) {
        alert(`Gagal: ${err.response.data.message}`);
      } else if (err.response?.status === 404) {
        alert('Gagal: User yang akan diupdate tidak ditemukan.');
      } else {
        alert('Gagal memperbarui data pasien.');
      }
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar activePage="Data Pasien" />
      <div className="flex-1 bg-gray-50 p-8">
        <h2 className="text-2xl font-semibold mb-6">Edit Data Pasien</h2>
        <form onSubmit={handleSubmit} className="max-w-lg bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Nama</label>
            <input
              type="text"
              id="name"
              name="name"
              value={user.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="age" className="block text-gray-700 font-medium mb-2">Umur</label>
            <input
              type="number"
              id="age"
              name="age"
              value={user.age}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="gender" className="block text-gray-700 font-medium mb-2">Jenis Kelamin</label>
            <select
              id="gender"
              name="gender"
              value={user.gender}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih jenis kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="address" className="block text-gray-700 font-medium mb-2">Alamat</label>
            <textarea
              id="address"
              name="address"
              value={user.address}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Simpan Perubahan
          </button>
        </form>
      </div>
    </div>
  );
}
