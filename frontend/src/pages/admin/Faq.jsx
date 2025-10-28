import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import apiClient from '../../api/axiosConfig'; // Ganti axios dengan apiClient

const FaqFormModal = ({ isOpen, onClose, onSave, faq }) => {
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');

  useEffect(() => {
    setJudul(faq ? faq.judul : '');
    setDeskripsi(faq ? faq.deskripsi : '');
  }, [faq]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...faq, judul, deskripsi });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">{faq ? 'Edit' : 'Tambah'} Fun Fact</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Judul</label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Deskripsi</label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              rows="4"
              required
            ></textarea>
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Faq() {
  const [faqs, setFaqs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFaq, setCurrentFaq] = useState(null);

  const fetchFaqs = async () => {
    try {
      const res = await apiClient.get('/faq');
      setFaqs(res.data);
    } catch (e) {
      console.error("Gagal mengambil data FAQ:", e);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleOpenModal = (faq = null) => {
    setCurrentFaq(faq);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentFaq(null);
  };

  const handleSaveFaq = async (faqData) => {
    try {
      if (faqData.id) {
        await apiClient.put(`/faq/${faqData.id}`, faqData);
        alert('Data berhasil diperbarui!');
      } else {
        await apiClient.post('/faq', faqData);
        alert('Data berhasil ditambahkan!');
      }
      fetchFaqs();
      handleCloseModal();
    } catch (error) {
      console.error("Gagal menyimpan FAQ:", error);
      alert("Gagal menyimpan data. Silakan cek konsol untuk detail error.");
    }
  };

  const handleDeleteFaq = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        await apiClient.delete(`/faq/${id}`);
        alert('Data berhasil dihapus!');
        fetchFaqs();
      } catch (error) {
        console.error("Gagal menghapus FAQ:", error);
        alert("Gagal menghapus data. Silakan cek konsol untuk detail error.");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activePage="FaQ" />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manajemen Fun Facts</h1>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
          >
            <FaPlus className="mr-2" /> Tambah Baru
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left font-semibold">Judul</th>
                <th className="p-4 text-left font-semibold">Deskripsi</th>
                <th className="p-4 text-left font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((faq) => (
                <tr key={faq.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium">{faq.judul}</td>
                  <td className="p-4 text-gray-600">{faq.deskripsi}</td>
                  <td className="p-4 flex space-x-3">
                    <button
                      onClick={() => handleOpenModal(faq)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(faq.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Hapus"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {faqs.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-4 text-center text-gray-500">
                    Tidak ada data fun fact
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <FaqFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveFaq}
          faq={currentFaq}
        />
      </div>
    </div>
  );
}
