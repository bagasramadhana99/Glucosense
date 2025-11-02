import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import {
  FaEdit,
  FaTrash,
  FaPlus,
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

// ============================
// Form Modal (Tambah/Edit)
// ============================
const FaqFormModal = ({ isOpen, onClose, onSave, faq }) => {
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setJudul(faq?.judul || '');
      setDeskripsi(faq?.deskripsi || '');
    }
  }, [faq, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!judul.trim() || !deskripsi.trim()) return;

    setSaving(true);
    await onSave({ ...faq, judul: judul.trim(), deskripsi: deskripsi.trim() });
    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="bg-cardWhite rounded-xl shadow-xl border border-lineGray max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-textPrimary mb-5">
          {faq ? 'Edit Fun Fact' : 'Tambah Fun Fact Baru'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-textPrimary mb-1">Judul</label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-lineGray bg-cardWhite text-sm text-textPrimary placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primaryBlue/20 focus:border-primaryBlue transition-all"
              placeholder="Masukkan judul fun fact"
              required
              disabled={saving}
            />
          </div>
          <div className="mb-5">
            <label className="block text-sm font-medium text-textPrimary mb-1">Deskripsi</label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-lineGray bg-cardWhite text-sm text-textPrimary placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primaryBlue/20 focus:border-primaryBlue transition-all resize-none"
              rows="4"
              placeholder="Masukkan deskripsi lengkap"
              required
              disabled={saving}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2 text-sm font-medium text-textSecondary bg-neutralBg rounded-lg hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-5 py-2 text-sm font-medium text-white rounded-lg transition-all ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primaryBlue hover:bg-[#1a3355] hover:shadow-md'
              }`}
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================
// Loading Skeleton
// ============================
const LoadingSkeleton = () => (
  <div className="space-y-3">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-cardWhite rounded-lg shadow-sm border border-lineGray p-4">
        <div className="h-5 bg-gray-200 rounded w-48 animate-pulse mb-2" />
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
      </div>
    ))}
  </div>
);

// ============================
// Main Component
// ============================
export default function Faq() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentFaq, setCurrentFaq] = useState(null);

  // Modal States
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleteTitle, setDeleteTitle] = useState('');

  // === Fetch FAQs ===
  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/faq');
      setFaqs(res.data);
    } catch {
      setErrorMsg('Gagal memuat data fun fact.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  // === Handlers ===
  const openForm = (faq = null) => {
    setCurrentFaq(faq);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setCurrentFaq(null);
  };

  const handleSave = async (faqData) => {
    try {
      if (faqData.id) {
        await apiClient.put(`/faq/${faqData.id}`, faqData);
      } else {
        await apiClient.post('/faq', faqData);
      }
      setShowSuccess(true);
      fetchFaqs();
      closeForm();
    } catch {
      setErrorMsg('Gagal menyimpan data fun fact.');
      setShowError(true);
    }
  };

  const openDelete = (id, judul) => {
    setDeleteId(id);
    setDeleteTitle(judul);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setShowConfirm(false);
    try {
      await apiClient.delete(`/faq/${deleteId}`);
      setShowSuccess(true);
      fetchFaqs();
    } catch {
      setErrorMsg('Gagal menghapus fun fact.');
      setShowError(true);
    } finally {
      setDeleteId(null);
      setDeleteTitle('');
    }
  };

  return (
    <div className="flex h-screen bg-neutralBg font-sans">
      <Sidebar activePage="FaQ" />

      <main className="flex-1 p-5 md:p-7 overflow-y-auto">
        {/* Header */}
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-textPrimary">Manajemen Fun Facts</h1>
            <p className="text-sm text-textSecondary mt-1">
              Kelola informasi edukasi diabetes dan kesehatan
            </p>
          </div>
          <button
            onClick={() => openForm()}
            className="flex items-center gap-2 px-5 py-2.5 bg-primaryBlue text-white rounded-full font-medium text-sm hover:bg-[#1a3355] hover:shadow-md transition-all duration-200"
          >
            <FaPlus /> Tambah Baru
          </button>
        </header>

        {/* Content */}
        <section className="bg-cardWhite rounded-xl shadow-sm border border-lineGray overflow-hidden">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton />
            </div>
          ) : faqs.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-textSecondary text-sm">Belum ada fun fact.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutralBg text-textSecondary text-xs font-medium uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">Judul</th>
                    <th className="px-6 py-3 text-left">Deskripsi</th>
                    <th className="px-6 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lineGray">
                  {faqs.map((faq) => (
                    <tr key={faq.id} className="hover:bg-neutralBg/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-textPrimary max-w-xs truncate">
                        {faq.judul}
                      </td>
                      <td className="px-6 py-4 text-textSecondary text-xs max-w-md truncate">
                        {faq.deskripsi}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center gap-3">
                          <button
                            onClick={() => openForm(faq)}
                            className="text-primaryBlue hover:text-[#1a3355] transition-colors"
                            title="Edit"
                          >
                            <FaEdit size={15} />
                          </button>
                          <button
                            onClick={() => openDelete(faq.id, faq.judul)}
                            className="text-errorRed hover:text-red-700 transition-colors"
                            title="Hapus"
                          >
                            <FaTrash size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* === MODALS === */}
      {/* Form Modal */}
      <FaqFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        onSave={handleSave}
        faq={currentFaq}
      />

      {/* Confirm Delete */}
      <Modal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setDeleteId(null);
          setDeleteTitle('');
        }}
        title="Hapus Fun Fact?"
        message={`Hapus fun fact "${deleteTitle}"? Tindakan ini tidak dapat dibatalkan.`}
        type="confirm"
        onConfirm={confirmDelete}
      />

      {/* Success */}
      <Modal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Berhasil!"
        message="Fun fact berhasil disimpan/dihapus."
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