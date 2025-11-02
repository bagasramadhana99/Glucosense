import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import apiClient from '../../api/axiosConfig';

// === Modal Component (Sama persis dengan EditPasien) ===
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
                Tidak
              </button>
              <button
                onClick={onConfirm}
                className="px-5 py-2 text-sm font-medium text-white bg-primaryBlue rounded-lg hover:bg-[#1a3355] hover:shadow-md transition-all"
              >
                Ya, {type === 'confirm' ? 'Tambah' : 'Batalkan'}
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

export default function TambahPasien() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [newUser, setNewUser] = useState({
    name: '',
    age: '',
    email: '',
    gender: 'Laki-laki',
    address: '',
    password: '',
    role: 'pasien',
  });

  // Modal States
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!newUser.password) {
      setError('Password tidak boleh kosong.');
      return;
    }
    if (newUser.password.length < 6) {
      setError('Password minimal harus 6 karakter.');
      return;
    }

    setShowConfirm(true);
  };

  const confirmAdd = async () => {
    setShowConfirm(false);
    setSaving(true);
    try {
      const payload = {
        ...newUser,
        age: newUser.age ? parseInt(newUser.age, 10) : null,
        role: 'patient',
      };

      await apiClient.post('/users', payload);
      setShowSuccess(true);
    } catch (err) {
      console.error('Gagal tambah pasien:', err.response ? err.response.data : err.message);
      const msg =
        err.response?.data?.message || 'Gagal menambahkan pasien. Silakan coba lagi.';
      setErrorMessage(msg);
      setShowError(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowCancel(true);
  };

  const confirmCancel = () => {
    setShowCancel(false);
    navigate('/admin/data-pasien');
  };

  return (
    <div className="flex h-screen bg-neutralBg font-sans">
      <Sidebar activePage="Data Pasien" />

      <main className="flex-1 p-5 md:p-7 overflow-y-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-textPrimary">Tambah Pasien Baru</h1>
          <p className="text-sm text-textSecondary mt-1">Isi data pasien dengan lengkap dan akurat</p>
        </header>

        {/* Form Card */}
        <section className="bg-cardWhite rounded-xl shadow-sm border border-lineGray overflow-hidden max-w-3xl mx-auto">
          <div className="p-6 md:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-errorRed text-sm rounded-lg flex items-center gap-2">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nama */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-textPrimary mb-1.5">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-lineGray bg-white text-textPrimary placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primaryBlue/20 focus:border-primaryBlue transition-all"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                {/* Umur */}
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-textPrimary mb-1.5">
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
                    className="w-full px-4 py-2.5 rounded-lg border border-lineGray bg-white text-textPrimary placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primaryBlue/20 focus:border-primaryBlue transition-all"
                    placeholder="Contoh: 45"
                  />
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-textPrimary mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-lineGray bg-white text-textPrimary placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primaryBlue/20 focus:border-primaryBlue transition-all"
                    placeholder="pasien@example.com"
                  />
                </div>

                {/* Password */}
                <div className="md:col-span-2">
                  <label htmlFor="password" className="block text-sm font-medium text-textPrimary mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-lineGray bg-white text-textPrimary placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primaryBlue/20 focus:border-primaryBlue transition-all"
                    placeholder="Minimal 6 karakter"
                  />
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-textPrimary mb-1.5">
                    Jenis Kelamin
                  </label>
                  <select
                    name="gender"
                    id="gender"
                    value={newUser.gender}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-lineGray bg-white text-textPrimary focus:outline-none focus:ring-2 focus:ring-primaryBlue/20 focus:border-primaryBlue transition-all"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                {/* Alamat */}
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-textPrimary mb-1.5">
                    Alamat
                  </label>
                  <textarea
                    name="address"
                    id="address"
                    value={newUser.address}
                    onChange={handleInputChange}
                    rows={3}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-lineGray bg-white text-textPrimary placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primaryBlue/20 focus:border-primaryBlue transition-all resize-none"
                    placeholder="Masukkan alamat lengkap"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-7 py-2.5 bg-neutralBg text-textPrimary font-medium text-sm rounded-full hover:bg-gray-200 hover:shadow-md transition-all duration-200 active:scale-95"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className={`px-7 py-2.5 bg-primaryBlue text-white font-medium text-sm rounded-full transition-all duration-200 flex items-center gap-2
                    ${saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#1a3355] hover:shadow-md active:scale-95'}
                  `}
                >
                  {saving ? <>Menambahkan...</> : <>Tambah Pasien</>}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* === MODALS === */}
      {/* Konfirmasi Tambah */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Tambah Pasien Baru?"
        message="Pastikan semua data sudah benar sebelum menambahkan pasien."
        type="confirm"
        onConfirm={confirmAdd}
      />

      {/* Konfirmasi Batal */}
      <Modal
        isOpen={showCancel}
        onClose={() => setShowCancel(false)}
        title="Batalkan Penambahan?"
        message="Data yang sudah diisi akan hilang. Lanjutkan?"
        type="confirm"
        onConfirm={confirmCancel}
      />

      {/* Sukses */}
      <Modal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigate('/admin/data-pasien');
        }}
        title="Berhasil!"
        message="Pasien baru berhasil ditambahkan."
        type="success"
      />

      {/* Gagal */}
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