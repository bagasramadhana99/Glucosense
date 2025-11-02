import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import {
  FaUserShield,
  FaSignOutAlt,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
} from 'react-icons/fa';
import apiClient from '../../api/axiosConfig';

// ============================
// Reusable Modal (Sama di seluruh app)
// ============================
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
                Ya, {type === 'confirm' && onConfirm.name === 'confirmLogout' ? 'Logout' : 'Tambah'}
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

// ============================
// Main Component
// ============================
export default function Setting() {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'Laki-laki',
    address: '',
    role: 'admin',
  });

  const [isLoading, setIsLoading] = useState(false);

  // Modal States
  const [showConfirmAdd, setShowConfirmAdd] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [adminName, setAdminName] = useState('');

  // === Handlers ===
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setErrorMsg('Nama, Email, dan Password wajib diisi.');
      setShowError(true);
      return false;
    }
    return true;
  };

  const openAddConfirm = () => {
    if (!validateForm()) return;
    setAdminName(formData.name);
    setShowConfirmAdd(true);
  };

  const confirmAddAdmin = async () => {
    setShowConfirmAdd(false);
    setIsLoading(true);

    try {
      await apiClient.post('/users', formData);
      setShowSuccess(true);
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        age: '',
        gender: 'Laki-laki',
        address: '',
        role: 'admin',
      });
    } catch (err) {
      console.error('Gagal menambah admin:', err);
      setErrorMsg(
        err.response?.data?.message || 'Gagal menambahkan admin. Silakan coba lagi.'
      );
      setShowError(true);
    } finally {
      setIsLoading(false);
      setAdminName('');
    }
  };

  const confirmLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-neutralBg font-sans">
      <Sidebar activePage="Pengaturan" />

      <main className="flex-1 p-5 md:p-7 overflow-y-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-textPrimary">Pengaturan</h1>
          <p className="text-sm text-textSecondary mt-1">
            Kelola akun dan tambahkan admin baru
          </p>
        </header>

        <div className="space-y-6">
          {/* === Kartu Logout === */}
          <section className="bg-cardWhite rounded-xl shadow-sm border border-lineGray p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-textPrimary flex items-center gap-2">
                  <FaSignOutAlt className="text-errorRed" />
                  Keluar dari Akun
                </h2>
                <p className="text-sm text-textSecondary mt-1">
                  Akhiri sesi Anda saat ini
                </p>
              </div>
              <button
                onClick={() => setShowConfirmLogout(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-errorRed text-white rounded-full font-medium text-sm hover:bg-red-700 hover:shadow-md transition-all duration-200"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </section>

          {/* === Kartu Tambah Admin === */}
          <section className="bg-cardWhite rounded-xl shadow-sm border border-lineGray p-6">
            <h2 className="text-lg font-semibold text-textPrimary flex items-center gap-2 mb-5">
              <FaUserShield className="text-primaryBlue" />
              Tambah Admin Baru
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                openAddConfirm();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nama */}
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-1">
                    Nama Lengkap <span className="text-errorRed">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-lineGray bg-cardWhite text-sm text-textPrimary placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primaryBlue/20 focus:border-primaryBlue transition-all"
                    placeholder="Masukkan nama"
                    disabled={isLoading}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-1">
                    Email <span className="text-errorRed">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-lineGray bg-cardWhite text-sm text-textPrimary placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primaryBlue/20 focus:border-primaryBlue transition-all"
                    placeholder="admin@contoh.com"
                    disabled={isLoading}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-1">
                    Password <span className="text-errorRed">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-lineGray bg-cardWhite text-sm text-textPrimary placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primaryBlue/20 focus:border-primaryBlue transition-all"
                    placeholder="Minimal 6 karakter"
                    disabled={isLoading}
                  />
                </div>

                {/* Usia */}
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-1">
                    Usia
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="18"
                    max="100"
                    className="w-full px-3 py-2 rounded-lg border border-lineGray bg-cardWhite text-sm text-textPrimary placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primaryBlue/20 focus:border-primaryBlue transition-all"
                    placeholder="30"
                    disabled={isLoading}
                  />
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-lineGray bg-cardWhite text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primaryBlue/20 focus:border-primaryBlue transition-all"
                    disabled={isLoading}
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                {/* Alamat */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-textPrimary mb-1">
                    Alamat
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-3 py-2 rounded-lg border border-lineGray bg-cardWhite text-sm text-textPrimary placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primaryBlue/20 focus:border-primaryBlue transition-all resize-none"
                    placeholder="Jl. Contoh No. 123"
                    disabled={isLoading}
                  />
                </div>

                {/* Role Info */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-textPrimary mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value="Admin (Otomatis)"
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border border-lineGray bg-neutralBg text-sm text-textSecondary cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm transition-all ${
                    isLoading
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-primaryBlue text-white hover:bg-[#1a3355] hover:shadow-md'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Menambahkan...
                    </>
                  ) : (
                    'Tambah Admin'
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>

      {/* === MODALS === */}
      {/* Confirm Add Admin */}
      <Modal
        isOpen={showConfirmAdd}
        onClose={() => {
          setShowConfirmAdd(false);
          setAdminName('');
        }}
        title="Tambah Admin Baru?"
        message={`Yakin ingin menambahkan admin "${adminName}"?`}
        type="confirm"
        onConfirm={confirmAddAdmin}
      />

      {/* Confirm Logout */}
      <Modal
        isOpen={showConfirmLogout}
        onClose={() => setShowConfirmLogout(false)}
        title="Keluar dari Akun?"
        message="Anda akan logout dari sesi ini. Lanjutkan?"
        type="confirm"
        onConfirm={confirmLogout}
      />

      {/* Success */}
      <Modal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Berhasil!"
        message="Admin baru berhasil ditambahkan."
        type="success"
      />

      {/* Error */}
      <Modal
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="Gagal"
        message={errorMsg}
        type="error"
      />
    </div>
  );
}