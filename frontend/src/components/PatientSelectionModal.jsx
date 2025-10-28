import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig'; // Ganti axios dengan apiClient

const PatientSelectionModal = ({ isOpen, onClose, onSave, glucoseData, heartRateData }) => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setError('');

    apiClient.get('/patients') // Gunakan apiClient
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
  };

  if (!isOpen) return null;

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Pilih Pasien untuk Disimpan</h2>
          <p className="text-sm text-gray-600 mt-1">
            Data yang akan disimpan: Glukosa: <strong>{glucoseData}</strong>, Detak Jantung: <strong>{heartRateData}</strong>
          </p>
        </div>

        <div className="p-6">
          <input
            type="text"
            placeholder="Cari nama pasien..."
            className="w-full p-2 border rounded-md mb-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="max-h-64 overflow-y-auto border rounded-md">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-left w-12">Pilih</th>
                  <th className="p-3 text-left font-semibold">Nama Pasien</th>
                  <th className="p-3 text-left font-semibold">Email</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan="3" className="text-center p-4 text-gray-500">Memuat pasien...</td></tr>
                )}
                {error && (
                  <tr><td colSpan="3" className="text-center p-4 text-red-500">{error}</td></tr>
                )}
                {!loading && !error && filteredPatients.length === 0 && (
                  <tr><td colSpan="3" className="text-center p-4 text-gray-500">Tidak ada pasien yang ditemukan.</td></tr>
                )}
                {!loading && !error && filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-t hover:bg-gray-100">
                    <td className="p-3 text-center">
                      <input
                        type="radio"
                        name="patient-selection"
                        value={patient.id}
                        checked={selectedPatientId === patient.id}
                        onChange={() => setSelectedPatientId(patient.id)}
                        className="h-4 w-4 accent-indigo-600"
                      />
                    </td>
                    <td className="p-3">{patient.name}</td>
                    <td className="p-3 text-gray-500">{patient.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Simpan Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientSelectionModal;
