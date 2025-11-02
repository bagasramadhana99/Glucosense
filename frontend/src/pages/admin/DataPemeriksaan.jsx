import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import {
  FaSearch,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
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
// Patient Accordion Item
// ============================
const PatientAccordion = React.memo(({ patientId, patient, isOpen, onToggle, onDelete }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = (recordId) => {
    setDeletingId(recordId);
    onDelete(recordId, patient.name);
  };

  return (
    <div className="bg-cardWhite rounded-xl shadow-sm border border-lineGray overflow-hidden">
      {/* Header */}
      <button
        onClick={() => onToggle(patientId)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-neutralBg/30 transition-all duration-200"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primaryBlue/10 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-primaryBlue font-bold text-sm">{patient.name[0]}</span>
          </div>
          <div>
            <h3 className="font-semibold text-textPrimary text-base">{patient.name}</h3>
            <p className="text-xs text-textSecondary">
              {patient.records.length} rekaman pemeriksaan
            </p>
          </div>
        </div>
        <div className="text-primaryBlue transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
          <FaChevronDown size={16} />
        </div>
      </button>

      {/* Body with smooth height transition */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? '1000px' : '0', paddingTop: isOpen ? '1rem' : '0', paddingBottom: isOpen ? '1rem' : '0' }}
      >
        <div className="border-t border-lineGray px-5">
          {patient.records.length === 0 ? (
            <p className="py-6 text-center text-sm text-textSecondary">Tidak ada data pemeriksaan.</p>
          ) : (
            <div className="overflow-x-auto -mx-5">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-neutralBg text-textSecondary text-xs font-medium uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-left">Detak Jantung</th>
                    <th className="px-5 py-3 text-left">Glukosa</th>
                    <th className="px-5 py-3 text-left">Tanggal & Waktu</th>
                    <th className="px-5 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lineGray">
                  {patient.records.map((record) => (
                    <tr key={record.id} className="hover:bg-neutralBg/30 transition-colors">
                      <td className="px-5 py-3">
                        <span className="font-medium text-textPrimary">{record.heart_rate}</span>{' '}
                        <span className="text-textSecondary text-xs">bpm</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-medium text-textPrimary">{record.glucose_level}</span>{' '}
                        <span className="text-textSecondary text-xs">mg/dL</span>
                      </td>
                      <td className="px-5 py-3 text-textSecondary text-xs">
                        {new Date(record.timestamp).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        <span className="text-textSecondary/80">
                          {new Date(record.timestamp).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => handleDelete(record.id)}
                          disabled={deletingId === record.id}
                          className={`text-errorRed hover:text-red-700 transition-colors ${
                            deletingId === record.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          title="Hapus rekaman"
                        >
                          {deletingId === record.id ? (
                            <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FaTrash size={14} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// ============================
// Loading Skeleton
// ============================
const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-cardWhite rounded-xl shadow-sm border border-lineGray p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 rounded w-56 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ============================
// Pagination Component
// ============================
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-lg transition-colors ${
          currentPage === 1 ? 'text-textSecondary cursor-not-allowed' : 'text-textPrimary hover:bg-neutralBg'
        }`}
      >
        <FaChevronLeft size={14} />
      </button>

      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i + 1}
          onClick={() => onPageChange(i + 1)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
            currentPage === i + 1
              ? 'bg-primaryBlue text-white shadow-sm'
              : 'text-textPrimary hover:bg-neutralBg'
          }`}
        >
          {i + 1}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-lg transition-colors ${
          currentPage === totalPages ? 'text-textSecondary cursor-not-allowed' : 'text-textPrimary hover:bg-neutralBg'
        }`}
      >
        <FaChevronRight size={14} />
      </button>
    </div>
  );
};

// ============================
// Main Component
// ============================
export default function DataPemeriksaan() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [openId, setOpenId] = useState(null);

  // Modal States
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');

  const itemsPerPage = 8;

  // === Fetch Data ===
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/monitoring');
      setData(res.data);
    } catch (err) {
      console.error('Gagal memuat data:', err);
      setErrorMsg('Gagal memuat data pemeriksaan. Silakan coba lagi.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  // === Group by Patient ===
  const grouped = useMemo(() => {
    const map = {};
    data.forEach((item) => {
      const id = item.user_id;
      if (!map[id]) {
        map[id] = {
          name: item.namaPasien || `Pasien #${id}`,
          records: [],
        };
      }
      map[id].records.push(item);
    });
    // Sort records newest first
    Object.values(map).forEach((p) => {
      p.records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    });
    return map;
  }, [data]);

  // === Filter & Paginate ===
  const filteredIds = useMemo(() => {
    return Object.keys(grouped).filter((id) =>
      grouped[id].name.toLowerCase().includes(search.toLowerCase())
    );
  }, [grouped, search]);

  const totalPages = Math.ceil(filteredIds.length / itemsPerPage);
  const paginatedIds = filteredIds.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // === Handlers ===
  const toggle = useCallback((id) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  const openDelete = useCallback((recordId, patientName) => {
    setDeleteId(recordId);
    setDeleteName(patientName);
    setShowConfirm(true);
  }, []);

  const confirmDelete = async () => {
    setShowConfirm(false);
    try {
      await apiClient.delete(`/monitoring/${deleteId}`);
      setShowSuccess(true);
      fetchData();
    } catch {
      setErrorMsg('Gagal menghapus data pemeriksaan.');
      setShowError(true);
    } finally {
      setDeleteId(null);
      setDeleteName('');
    }
  };

  const handlePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setOpenId(null); // Close all on page change
    }
  };

  return (
    <div className="flex h-screen bg-neutralBg font-sans">
      <Sidebar activePage="Data Pemeriksaan" />

      <main className="flex-1 p-5 md:p-7 overflow-y-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-textPrimary">Data Pemeriksaan Pasien</h1>
          <p className="text-sm text-textSecondary mt-1">
            Kelola hasil pemeriksaan glukosa dan detak jantung semua pasien
          </p>
        </header>

        {/* Search */}
        <div className="mb-6 max-w-md">
          <div className="relative">
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

        {/* Content */}
        <section className="space-y-4">
          {loading ? (
            <LoadingSkeleton />
          ) : filteredIds.length === 0 ? (
            <div className="bg-cardWhite rounded-xl shadow-sm border border-lineGray p-12 text-center">
              <p className="text-textSecondary text-sm">
                {search ? 'Tidak ada pasien yang sesuai.' : 'Belum ada data pemeriksaan.'}
              </p>
            </div>
          ) : (
            paginatedIds.map((id) => (
              <PatientAccordion
                key={id}
                patientId={id}
                patient={grouped[id]}
                isOpen={openId === id}
                onToggle={toggle}
                onDelete={openDelete}
              />
            ))
          )}
        </section>

        {/* Pagination */}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePage} />
      </main>

      {/* === MODALS === */}
      <Modal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setDeleteId(null);
          setDeleteName('');
        }}
        title="Hapus Rekaman?"
        message={`Hapus data pemeriksaan pasien "${deleteName}"? Tindakan ini tidak dapat dibatalkan.`}
        type="confirm"
        onConfirm={confirmDelete}
      />

      <Modal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Berhasil!"
        message="Data pemeriksaan berhasil dihapus."
        type="success"
      />

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