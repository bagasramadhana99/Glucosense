import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { FaTrash, FaEdit, FaSearch } from 'react-icons/fa'; // Menambahkan ikon search
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosConfig'; // gunakan axios instance

export default function DataPasien() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetch users:', err);
      alert('Gagal memuat data pasien.');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Yakin ingin menghapus pasien ini?')) return;

    try {
      await apiClient.delete(`/users/${id}`);
      alert('User berhasil dihapus!');
      fetchUsers();
    } catch (error) {
      console.error('Gagal menghapus user:', error);
      if (error.response?.status === 409) {
        alert(
          `Gagal Menghapus: ${error.response.data.message}\n\n(Pastikan semua data terkait pasien ini, seperti rekam medis, sudah dihapus terlebih dahulu).`
        );
      } else {
        alert('Terjadi kesalahan saat menghapus pasien.');
      }
    }
  };

  const filteredData = users.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activePage="Data Pasien" />
      
      {/* Konten Utama */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Manajemen Data Pasien</h1>

        {/* Header Aksi: Tombol Tambah dan Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <button
            onClick={() => navigate('/admin/tambah-pasien')}
            className="bg-green-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition duration-300 w-full md:w-auto"
          >
            Tambah Pasien Baru
          </button>

          <div className="relative w-full md:w-1/3">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <FaSearch className="text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Cari nama pasien..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Kontainer Tabel Modern */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-xs text-gray-600 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 tracking-wider">Nama</th>
                  <th scope="col" className="px-6 py-3 tracking-wider">Umur</th>
                  <th scope="col" className="px-6 py-3 tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 tracking-wider">Jenis Kelamin</th>
                  <th scope="col" className="px-6 py-3 tracking-wider">Alamat</th>
                  <th scope="col" className="px-6 py-3 tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr 
                      key={item.id} 
                      className="bg-white border-b hover:bg-gray-50 transition duration-150 ease-in-out"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {item.name}
                      </td>
                      <td className="px-6 py-4">{item.age}</td>
                      <td className="px-6 py-4">{item.email}</td>
                      <td className="px-6 py-4">{item.gender}</td>
                      <td className="px-6 py-4">{item.address}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center space-x-4">
                          <button
                            onClick={() => navigate(`/admin/edit-pasien/${item.id}`)}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                            title="Edit Pasien"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            onClick={() => deleteUser(item.id)}
                            className="text-red-600 hover:text-red-800 transition-colors duration-200"
                            title="Hapus Pasien"
                          >
                            <FaTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-500">
                      Data pasien tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}