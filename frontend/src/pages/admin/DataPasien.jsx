import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { FaTrash, FaEdit, FaSearch, FaChevronLeft, FaChevronRight, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosConfig';

// =========================
// Reusable Modal Component (Sama persis EditPasien & Monitoring)
// =========================
const Modal = ({ isOpen, onClose, title, message, type = 'info', onConfirm }) => {
  if (!isOpen) return null;

  const types = {
    confirm: { icon: FaExclamationTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    success: { icon: FaCheck, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    error: { icon: FaTimes, color: 'text-errorRed', bg: 'bg-red-50', border: 'border-red-200' },
  };

  const { icon: Icon, color, bg, border } = types[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="bg-cardWhite rounded-xl shadow-xl border border-lineGray max-w-md w-full p-6 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center gap-3 p-3 rounded-lg ${bg} ${border} mb-4`}>
          <Icon className={`text-lg ${color}`} />
          <p className={`font-semibold text-sm ${color}`}>{title}</p>
        </div>

        <p className="text-sm text-textPrimary mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          {type === 'confirm' && (
            <>
              <button
                onClick={onClose}
                className="px-5 py-2 text-sm font-medium text-textSecondary bg-neutralBg rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={onConfirm}
                className="px-5 py-2 text-sm font-medium text-white bg-primaryBlue rounded-lg hover:bg-[#1a3355] hover:shadow-md transition-all"
              >
                Ya, Hapus
              </button>
            </>
          )}
          {(type === 'success' || type === 'error') && (
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-white bg-primaryBlue rounded-lg hover:bg-[#1a3355] hover:shadow-md transition-all"
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// =========================
// Main Component: DataPasien
// =========================
export default function DataPasien() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null); // ID yang sedang dihapus
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const itemsPerPage = 8;

  // Modal States
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  // === Fetch Users ===
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetch users:', err);
      setErrorMessage('Gagal memuat data pasien.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  // === Handle Delete ===
  const handleDelete = async () => {
    if (!selectedUser) return;

    setShowDeleteConfirm(false);
    setDeleting(selectedUser.id);

    try {
      await apiClient.delete(`/users/${selectedUser.id}`);
      setShowSuccess(true);
      fetchUsers(); // Refresh data
    } catch (error) {
      console.error('Gagal menghapus user:', error);
      const msg =
        error.response?.status === 409
          ? `${error.response.data.message}\n\n(Pastikan semua data terkait pasien ini, seperti rekam medis, sudah dihapus terlebih dahulu).`
          : 'Terjadi kesalahan saat menghapus pasien.';
      setErrorMessage(msg);
      setShowError(true);
    } finally {
      setDeleting(null);
      setSelectedUser(null);
    }
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  // === Filter & Pagination ===
  const filteredData = users.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex h-screen bg-neutralBg font-sans">
      <Sidebar activePage="Data Pasien" />

      <main className="flex-1 p-5 md:p-7 overflow-y-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-textPrimary">Manajemen Data Pasien</h1>
          <p className="text-sm text-textSecondary mt-1">Kelola data pasien dengan mudah dan aman</p>
        </header>

        {/* Aksi: Tambah + Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-5">
          <button
            onClick={() => navigate('/admin/tambah-pasien')}
            className="bg-primaryBlue text-white px-5 py-2.5 rounded-full font-medium text-sm hover:bg-[#1a3355] hover:shadow-md transition-all duration-200 flex items-center gap-2"
          >
            Tambah Pasien Baru
          </button>

          <div className="relative w-full md:w-80">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary text-sm" />
            <input
              type="text"
              placeholder="Cari nama pasien..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-lineGray bg-cardWhite text-sm text-textPrimary placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primaryBlue/20 focus:border-primaryBlue transition-all"
            />
          </div>
        </div>

        {/* Tabel */}
        <section className="bg-cardWhite rounded-xl shadow-sm border border-lineGray overflow-hidden">
          {loading ? (
            <div className="p-8">
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-textSecondary text-sm">Tidak ada data pasien yang ditemukan.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-neutralBg text-textSecondary text-xs font-medium uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3 text-left">Nama</th>
                      <th className="px-5 py-3 text-left">Umur</th>
                      <th className="px-5 py-3 text-left hidden md:table-cell">Email</th>
                      <th className="px-5 py-3 text-left">Jenis Kelamin</th>
                      <th className="px-5 py-3 text-left hidden lg:table-cell">Alamat</th>
                      <th className="px-5 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-lineGray">
                    {paginatedData.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-neutralBg/50 transition-colors ${
                          index % 2 === 0 ? 'bg-cardWhite' : 'bg-neutralBg/20'
                        }`}
                      >
                        <td className="px-5 py-3.5 font-medium text-textPrimary">{item.name}</td>
                        <td className="px-5 py-3.5 text-textSecondary">{item.age}</td>
                        <td className="px-5 py-3.5 text-textSecondary hidden md:table-cell truncate max-w-xs">
                          {item.email}
                        </td>
                        <td className="px-5 py-3.5 text-textSecondary">{item.gender}</td>
                        <td className="px-5 py-3.5 text-textSecondary hidden lg:table-cell truncate max-w-xs">
                          {item.address}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <div className="flex justify-center items-center gap-3">
                            <button
                              onClick={() => navigate(`/admin/edit-pasien/${item.id}`)}
                              className="text-primaryBlue hover:text-[#1a3355] transition-colors"
                              title="Edit"
                            >
                              <FaEdit size={15} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(item)}
                              disabled={deleting === item.id}
                              className={`text-errorRed hover:text-red-700 transition-colors ${
                                deleting === item.id ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              title="Hapus"
                            >
                              {deleting === item.id ? (
                                <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <FaTrash size={15} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginasi */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center px-5 py-3 border-t border-lineGray bg-neutralBg/30">
                  <p className="text-xs text-textSecondary">
                    Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length} pasien
                  </p>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-1.5 rounded-lg transition-colors ${
                        currentPage === 1
                          ? 'text-textSecondary cursor-not-allowed'
                          : 'text-textPrimary hover:bg-neutralBg'
                      }`}
                    >
                      <FaChevronLeft size={14} />
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                          currentPage === i + 1
                            ? 'bg-primaryBlue text-white shadow-sm'
                            : 'text-textPrimary hover:bg-neutralBg'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`p-1.5 rounded-lg transition-colors ${
                        currentPage === totalPages
                          ? 'text-textSecondary cursor-not-allowed'
                          : 'text-textPrimary hover:bg-neutralBg'
                      }`}
                    >
                      <FaChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* === MODALS === */}
      {/* Confirm Delete */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedUser(null);
        }}
        title="Hapus Pasien?"
        message={`Apakah Anda yakin ingin menghapus pasien "${selectedUser?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        type="confirm"
        onConfirm={handleDelete}
      />

      {/* Success */}
      <Modal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Berhasil!"
        message="Pasien berhasil dihapus."
        type="success"
      />

      {/* Error */}
      <Modal
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="Gagal"
        message={errorMessage}
        type="error"
      />
    </div>
  );
}