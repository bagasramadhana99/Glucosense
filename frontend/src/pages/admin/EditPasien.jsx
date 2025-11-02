import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import apiClient from '../../api/axiosConfig';

// === Modal Component ===
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
                Ya, {type === 'confirm' ? 'Simpan' : 'Batalkan'}
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

export default function EditPasien() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [user, setUser] = useState({
    name: '',
    age: '',
    email: '',
    gender: '',
    address: '',
    role: 'patient',
  });

  // Modal States
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
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
        setError('Gagal memuat data pasien.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setShowConfirmSave(true);
  };

  const confirmSave = async () => {
    setShowConfirmSave(false);
    setSaving(true);
    try {
      const payload = {
        ...user,
        age: user.age ? parseInt(user.age, 10) : null,
      };
      await apiClient.put(`/users/${id}`, payload);
      setShowSuccess(true);
    } catch (err) {
      console.error('Gagal memperbarui data:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.status === 404
          ? 'Pasien tidak ditemukan.'
          : 'Gagal memperbarui data pasien. Silakan coba lagi.';
      setErrorMessage(msg);
      setShowError(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmCancel(true);
  };

  const confirmCancel = () => {
    setShowConfirmCancel(false);
    navigate('/admin/data-pasien');
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-neutralBg">
        <Sidebar activePage="Data Pasien" />
        <main className="flex-1 p-5 md:p-7 flex items-center justify-center">
          <p className="text-textSecondary">Memuat data pasien...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutralBg font-sans">
      <Sidebar activePage="Data Pasien" />

      <main className="flex-1 p-5 md:p-7 overflow-y-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-textPrimary">Edit Data Pasien</h1>
          <p className="text-sm text-textSecondary mt-1">Perbarui informasi pasien dengan teliti</p>
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
                    id="name"
                    name="name"
                    value={user.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-lineGray bg-white text-textPrimary focus:outline-none focus:ring-2 focus:ring-primaryBlue/20 focus:border-primaryBlue transition-all"
                  />
                </div>

                {/* Umur */}
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-textPrimary mb-1.5">
                    Umur
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={user.age}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2.5 rounded-lg border border-lineGray bg-white text-textPrimary focus:outline-none focus:ring-2 focus:ring-primaryBlue/20 focus:border-primaryBlue transition-all"
                  />
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-textPrimary mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={user.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-lineGray bg-white text-textPrimary focus:outline-none focus:ring-2 focus:ring-primaryBlue/20 focus:border-primaryBlue transition-all"
                  />
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-textPrimary mb-1.5">
                    Jenis Kelamin
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={user.gender}
                    onChange={handleChange}
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
                    id="address"
                    name="address"
                    value={user.address}
                    onChange={handleChange}
                    rows={3}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-lineGray bg-white text-textPrimary focus:outline-none focus:ring-2 focus:ring-primaryBlue/20 focus:border-primaryBlue transition-all resize-none"
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
                  {saving ? <>Menyimpan...</> : <>Simpan Perubahan</>}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* === MODALS === */}
      {/* Konfirmasi Simpan */}
      <Modal
        isOpen={showConfirmSave}
        onClose={() => setShowConfirmSave(false)}
        title="Konfirmasi Perubahan"
        message="Apakah Anda yakin ingin menyimpan perubahan data pasien ini?"
        type="confirm"
        onConfirm={confirmSave}
      />

      {/* Konfirmasi Batal */}
      <Modal
        isOpen={showConfirmCancel}
        onClose={() => setShowConfirmCancel(false)}
        title="Batalkan Perubahan?"
        message="Perubahan yang belum disimpan akan hilang. Lanjutkan?"
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
        message="Data pasien berhasil diperbarui."
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