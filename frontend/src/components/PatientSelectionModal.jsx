import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';

const PatientSelectionModal = ({ isOpen, onClose, onSave }) => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setError('');

    apiClient.get('/patients')
      .then((response) => setPatients(response.data))
      .catch((err) => {
        console.error("Gagal mengambil daftar pasien:", err);
        setError("Gagal memuat daftar pasien.");
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleSave = () => {
    if (!selectedPatientId) {
      alert("Silakan pilih seorang pasien terlebih dahulu.");
      return;
    }

    const selectedPatient = patients.find(p => p.id === selectedPatientId);
    onSave(selectedPatient);
    onClose();
  };

  if (!isOpen) return null;

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 transition-opacity">
      <div className="bg-cardWhite rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-lineGray">
          <h2 className="text-2xl font-bold text-textPrimary">Pilih Pasien untuk Disimpan</h2>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Search Input */}
          <div className="relative mb-5">
            <input
              type="text"
              placeholder="Cari nama atau email pasien..."
              className="w-full pl-10 pr-4 py-3 border border-lineGray rounded-lg text-textPrimary placeholder-mutedGray focus:outline-none focus:ring-2 focus:ring-primaryBlue focus:border-transparent transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-mutedGray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Table Container */}
          <div className="max-h-64 overflow-y-auto border border-lineGray rounded-lg">
            <table className="w-full table-auto">
              <thead className="bg-neutralBg sticky top-0 z-10">
                <tr>
                  <th className="p-4 text-left w-12"></th>
                  <th className="p-4 text-left font-semibold text-textPrimary">Nama Pasien</th>
                  <th className="p-4 text-left font-semibold text-textPrimary">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lineGray">
                {loading && (
                  <>
                    {[1, 2, 3].map((i) => (
                      <tr key={i}>
                        <td colSpan="3" className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-5 h-5 bg-lineGray rounded-full animate-pulse"></div>
                            <div className="h-4 bg-lineGray rounded w-32 animate-pulse"></div>
                            <div className="h-4 bg-lineGray rounded w-48 animate-pulse ml-auto"></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                )}

                {error && (
                  <tr>
                    <td colSpan="3" className="text-center p-6 text-errorRed font-medium">{error}</td>
                  </tr>
                )}

                {!loading && !error && filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center p-6 text-mutedGray">Tidak ada pasien yang ditemukan.</td>
                  </tr>
                )}

                {!loading && !error && filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-neutralBg transition-colors duration-150 cursor-pointer"
                    onClick={() => setSelectedPatientId(patient.id)}
                  >
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <label className="flex items-center justify-center cursor-pointer">
                        <input
                          type="radio"
                          name="patient-selection"
                          value={patient.id}
                          checked={selectedPatientId === patient.id}
                          onChange={() => setSelectedPatientId(patient.id)}
                          className="sr-only"
                        />
                        <span
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                            ${selectedPatientId === patient.id
                              ? 'border-primaryBlue bg-primaryBlue'
                              : 'border-lineGray hover:border-primaryBlue'
                            }`}
                        >
                          {selectedPatientId === patient.id && (
                            <span className="w-2 h-2 bg-white rounded-full"></span>
                          )}
                        </span>
                      </label>
                    </td>
                    <td className="p-4 font-medium text-textPrimary">{patient.name}</td>
                    <td className="p-4 text-textSecondary">{patient.email || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-neutralBg border-t border-lineGray flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-lineGray text-textPrimary rounded-lg hover:bg-lineGray hover:border-mutedGray transition-colors font-medium"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!selectedPatientId}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all
              ${selectedPatientId
                ? 'bg-primaryBlue text-white hover:bg-softBlue shadow-md'
                : 'bg-mutedGray text-textSecondary cursor-not-allowed'
              }`}
          >
            Simpan Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientSelectionModal;