import React, { useEffect, useState, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import { FaSearch, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import apiClient from '../../api/axiosConfig';

// Komponen baru untuk menampilkan tabel detail pemeriksaan per pasien
const ExaminationDetailsTable = ({ records, onDelete }) => {
    if (!records || records.length === 0) {
        return <p className="text-sm text-gray-500 px-4 py-2">Tidak ada data pemeriksaan untuk pasien ini.</p>;
    }

    return (
        <div className="overflow-x-auto bg-gray-50 p-2 rounded-b-md border border-t-0 border-gray-200">
            <table className="min-w-full table-auto">
                <thead className="bg-gray-200 text-xs uppercase text-gray-700">
                    <tr>
                        <th className="px-4 py-2 text-left">Detak Jantung</th>
                        <th className="px-4 py-2 text-left">Kadar Glukosa</th>
                        <th className="px-4 py-2 text-left">Tanggal Pemeriksaan</th>
                        <th className="px-4 py-2 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {records.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-100">
                            <td className="px-4 py-2">{item.heart_rate} bpm</td>
                            <td className="px-4 py-2">{item.glucose_level} mg/dL</td>
                            <td className="px-4 py-2">
                                {new Date(item.timestamp).toLocaleString('id-ID', { 
                                    dateStyle: 'medium', 
                                    timeStyle: 'short' 
                                })}
                            </td>
                            <td className="px-4 py-2 text-center">
                                <button
                                    onClick={() => onDelete(item.id)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                    title="Hapus Data"
                                >
                                    <FaTrash size={14}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default function DataPemeriksaan() {
    const [pemeriksaan, setPemeriksaan] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPatientId, setSelectedPatientId] = useState(null); // State untuk melacak pasien yang dipilih

    useEffect(() => {
        fetchMonitoringData();
    }, []);

    const fetchMonitoringData = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await apiClient.get('/monitoring');
            setPemeriksaan(res.data);
        } catch (err) {
            console.error('Gagal mengambil data monitoring:', err);
            setError('Gagal memuat data pemeriksaan.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        // Gunakan modal kustom atau library notifikasi di aplikasi nyata
        // if (!window.confirm('Apakah Anda yakin ingin menghapus data pemeriksaan ini?')) return;
        
        // Sementara pakai konfirmasi bawaan
        if (window.confirm('Apakah Anda yakin ingin menghapus data pemeriksaan ini?')) {
            try {
                await apiClient.delete(`/monitoring/${id}`);
                alert('Data berhasil dihapus.'); // Ganti dengan notifikasi
                fetchMonitoringData(); // Muat ulang data
            } catch (err) {
                console.error('Gagal menghapus data pemeriksaan:', err);
                alert('Gagal menghapus data pemeriksaan.'); // Ganti dengan notifikasi
            }
        }
    };

    // Mengelompokkan data pemeriksaan berdasarkan user_id
    const groupedData = useMemo(() => {
        return pemeriksaan.reduce((acc, item) => {
            const patientId = item.user_id;
            if (!acc[patientId]) {
                acc[patientId] = { 
                    name: item.namaPasien || `Pasien ID ${patientId}`, // Fallback jika nama tidak ada
                    records: [] 
                };
            }
            acc[patientId].records.push(item);
            // Urutkan records terbaru di atas (opsional)
            acc[patientId].records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            return acc;
        }, {});
    }, [pemeriksaan]);

    // Filter pasien berdasarkan nama
    const filteredPatientIds = Object.keys(groupedData).filter(patientId =>
        groupedData[patientId].name.toLowerCase().includes(search.toLowerCase())
    );

    // Fungsi untuk toggle tampilan detail
    const toggleDetails = (patientId) => {
        setSelectedPatientId(selectedPatientId === patientId ? null : patientId);
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar activePage="Data Pemeriksaan" />
            <div className="flex-1 bg-gray-100 p-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">Data Pemeriksaan Pasien</h2>
                    </div>

                    <div className="flex items-center mb-6">
                        <div className="relative flex-1 max-w-sm">
                            <input
                                type="text"
                                placeholder="Cari nama pasien..."
                                className="w-full border rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    {/* Daftar Pasien */}
                    <div className="space-y-2">
                        {loading && <p className="text-center text-gray-500 py-4">Memuat data...</p>}
                        {error && <p className="text-center text-red-500 py-4">{error}</p>}
                        {!loading && !error && filteredPatientIds.length === 0 && (
                            <p className="text-center text-gray-500 py-4">Tidak ada data pasien yang ditemukan.</p>
                        )}
                        {!loading && !error && filteredPatientIds.map((patientId) => {
                            const patient = groupedData[patientId];
                            const isSelected = selectedPatientId === patientId;
                            return (
                                <div key={patientId} className="border border-gray-200 rounded-md shadow-sm">
                                    <button 
                                        onClick={() => toggleDetails(patientId)}
                                        className={`w-full flex justify-between items-center p-4 text-left rounded-t-md focus:outline-none transition-colors ${
                                            isSelected ? 'bg-indigo-100 text-indigo-800' : 'bg-white hover:bg-gray-50'
                                        } ${!isSelected && 'rounded-b-md'}`} // Bulatkan bawah jika tidak terbuka
                                    >
                                        <div>
                                            <span className="font-semibold text-lg">{patient.name}</span>
                                            <span className="text-sm text-gray-500 ml-2">({patient.records.length} rekaman)</span>
                                        </div>
                                        {isSelected ? <FaChevronUp className="text-indigo-600" /> : <FaChevronDown className="text-gray-400"/>}
                                    </button>
                                    
                                    {/* Tampilkan detail jika dipilih */}
                                    {isSelected && (
                                        <ExaminationDetailsTable 
                                            records={patient.records} 
                                            onDelete={handleDelete} 
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <footer className="text-center mt-10 text-sm text-gray-500">
                    copyright © Glucosense 2025
                </footer>
            </div>
        </div>
    );
}