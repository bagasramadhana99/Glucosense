import React, { useState, useEffect } from 'react'; // Impor useEffect
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosConfig';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { FaStethoscope, FaInfoCircle } from 'react-icons/fa'; // Impor ikon

export default function RiskPredictionPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        gender: '1', age: '', hypertension: '0', heart_disease: '0',
        smoking_history: '0', berat: '', tinggi: '', 
        hba1c_level: '', // Tetap ada di state, tapi dihitung otomatis
        blood_glucose: '', // Input utama
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // --- Penyesuaian: State untuk nilai HbA1c yang diestimasi ---
    const [estimatedHbA1c, setEstimatedHbA1c] = useState('');
    // -----------------------------------------------------------

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    // --- Efek untuk mengestimasi HbA1c saat Gula Darah Saat Ini berubah ---
    useEffect(() => {
        if (formData.blood_glucose && !isNaN(parseFloat(formData.blood_glucose)) && parseFloat(formData.blood_glucose) > 0) {
            const currentGlucose = parseFloat(formData.blood_glucose);
            // Estimasi HbA1c menggunakan rumus eAG (kurang akurat, tapi sesuai permintaan)
            const calculatedHbA1c = (currentGlucose + 46.7) / 28.7;
            const formattedHbA1c = calculatedHbA1c.toFixed(1); // Bulatkan 1 desimal
            
            setEstimatedHbA1c(formattedHbA1c); // Simpan estimasi untuk ditampilkan
            // Update state formData secara otomatis
            setFormData(prevState => ({
                ...prevState,
                hba1c_level: formattedHbA1c 
            }));
        } else {
            // Jika input gula darah kosong, kosongkan estimasi dan state
            setEstimatedHbA1c('');
            setFormData(prevState => ({ ...prevState, hba1c_level: '' }));
        }
    }, [formData.blood_glucose]); // Dijalankan setiap kali blood_glucose berubah
    // ----------------------------------------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validasi: Pastikan hba1c_level (yang diestimasi) ada
        if (!formData.hba1c_level) {
            setError("Gagal mengestimasi HbA1c. Pastikan Gula Darah Saat Ini terisi dengan benar.");
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Kirim formData yang sudah berisi hba1c_level hasil estimasi
            const response = await apiClient.post('/ml/predict', formData);
            navigate('/pasien/hasil-prediksi', { state: { result: response.data } });
        } catch (err) {
            console.error("Gagal melakukan prediksi:", err);
            if (err.response && err.response.status === 503) {
                setError("Layanan prediksi tidak tersedia saat ini. Hubungi admin.");
            } else {
                setError(err.response?.data?.error || "Terjadi kesalahan. Silakan coba lagi.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <Header />
            <main className="p-4 pb-28">
                <h1 className="text-2xl font-bold mb-1 text-gray-800 flex items-center">
                    <FaStethoscope className="mr-2 text-indigo-500" />
                    Prediksi Risiko Diabetes
                </h1>
                <p className="text-gray-600 mb-8">Isi formulir di bawah ini untuk melihat prediksi risiko diabetes Anda.</p>
                
                <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-md">
                    
                    {/* ... (Input Usia, Jenis Kelamin, Berat, Tinggi tidak berubah) ... */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="age" className="block text-sm font-medium text-gray-700">Usia (Tahun)</label>
                            <input type="number" name="age" id="age" value={formData.age} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Contoh: 55" />
                        </div>
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                            <select name="gender" id="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="1">Pria</option>
                                <option value="0">Wanita</option>
                            </select>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="berat" className="block text-sm font-medium text-gray-700">Berat Badan (kg)</label>
                            <input type="number" step="0.1" name="berat" id="berat" value={formData.berat} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Contoh: 70.5" />
                        </div>
                        <div>
                            <label htmlFor="tinggi" className="block text-sm font-medium text-gray-700">Tinggi Badan (cm)</label>
                            <input type="number" step="0.1" name="tinggi" id="tinggi" value={formData.tinggi} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Contoh: 165" />
                        </div>
                    </div>

                    {/* --- BAGIAN GULA DARAH & HbA1c YANG DISESUAIKAN --- */}
                    <div>
                        <label htmlFor="blood_glucose" className="block text-sm font-medium text-gray-700">Gula Darah Saat Ini (mg/dL)</label>
                        <input 
                            type="number" 
                            name="blood_glucose" 
                            id="blood_glucose" 
                            value={formData.blood_glucose} 
                            onChange={handleChange} 
                            required 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                            placeholder="Contoh: 140" 
                        />
                        {/* Tampilkan estimasi HbA1c jika ada */}
                        {estimatedHbA1c && (
                             <p className="mt-2 text-sm text-indigo-600 flex items-center">
                                <FaInfoCircle className="mr-1 flex-shrink-0"/> 
                                Estimasi Kadar HbA1c: <strong>{estimatedHbA1c}%</strong> 
                                <span className="ml-1 text-gray-500 text-xs">(dihitung otomatis)</span>
                             </p>
                        )}
                         <p className="mt-1 text-xs text-red-600">
                           *Estimasi HbA1c dari Gula Darah Saat Ini kurang akurat. Masukkan nilai HbA1c asli jika Anda tahu.
                         </p>
                    </div>
                    {/* Input HbA1c yang asli disembunyikan atau dihapus jika tidak diperlukan lagi */}
                    {/* <input 
                        type="hidden" 
                        name="hba1c_level" 
                        value={formData.hba1c_level} 
                    /> 
                    */}
                    {/* -------------------------------------------------------- */}


                    {/* ... (Input Hipertensi, Jantung, Merokok tidak berubah) ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="hypertension" className="block text-sm font-medium text-gray-700">Riwayat Hipertensi</label>
                            <select name="hypertension" id="hypertension" value={formData.hypertension} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="0">Tidak</option>
                                <option value="1">Ya</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="heart_disease" className="block text-sm font-medium text-gray-700">Riwayat Penyakit Jantung</label>
                            <select name="heart_disease" id="heart_disease" value={formData.heart_disease} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="0">Tidak</option>
                                <option value="1">Ya</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="smoking_history" className="block text-sm font-medium text-gray-700">Riwayat Merokok</label>
                        <select name="smoking_history" id="smoking_history" value={formData.smoking_history} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="0">Tidak Pernah</option>
                            <option value="1">Mantan Perokok</option>
                            <option value="2">Perokok Aktif</option>
                        </select>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={isLoading || !formData.hba1c_level} // Tetap disable jika hba1c belum terestimasi
                            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Memproses...' : 'Dapatkan Prediksi Risiko'}
                        </button>
                    </div>
                </form>

                {error && <p className="mt-4 text-center text-red-600">{error}</p>}
            </main>
            <BottomNav />
        </div>
    );
}