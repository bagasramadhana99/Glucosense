import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosConfig';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { FaStethoscope, FaInfoCircle, FaExclamationTriangle, FaCalculator, FaCheckCircle } from 'react-icons/fa';

export default function RiskPredictionPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        gender: '1', 
        age: '', 
        hypertension: '0', 
        heart_disease: '0',
        smoking_history: '0', 
        berat: '', 
        tinggi: '', 
        hba1c_level: '',
        blood_glucose: '',
        useEstimatedHbA1c: true, // Flag untuk menentukan apakah menggunakan HbA1c estimasi
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [estimatedHbA1c, setEstimatedHbA1c] = useState('');
    const [showHbA1cInfo, setShowHbA1cInfo] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox') {
            setFormData(prevState => ({ 
                ...prevState, 
                [name]: checked,
                // Jika beralih ke menggunakan HbA1c estimasi, kosongkan input manual
                hba1c_level: checked ? estimatedHbA1c : prevState.hba1c_level
            }));
        } else {
            setFormData(prevState => ({ ...prevState, [name]: value }));
        }
    };

    // Efek untuk mengestimasi HbA1c saat Gula Darah Saat Ini berubah
    useEffect(() => {
        if (formData.blood_glucose && !isNaN(parseFloat(formData.blood_glucose)) && parseFloat(formData.blood_glucose) > 0) {
            const currentGlucose = parseFloat(formData.blood_glucose);
            // Estimasi HbA1c menggunakan rumus eAG (Estimated Average Glucose)
            // Rumus: eAG (mg/dL) = (28.7 × HbA1c) - 46.7
            // Dibalik: HbA1c = (eAG + 46.7) / 28.7
            const calculatedHbA1c = (currentGlucose + 46.7) / 28.7;
            const formattedHbA1c = calculatedHbA1c.toFixed(1);
            
            setEstimatedHbA1c(formattedHbA1c);
            
            // Update state formData secara otomatis jika menggunakan estimasi
            if (formData.useEstimatedHbA1c) {
                setFormData(prevState => ({
                    ...prevState,
                    hba1c_level: formattedHbA1c 
                }));
            }
        } else {
            setEstimatedHbA1c('');
            if (formData.useEstimatedHbA1c) {
                setFormData(prevState => ({ ...prevState, hba1c_level: '' }));
            }
        }
    }, [formData.blood_glucose, formData.useEstimatedHbA1c]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validasi: Pastikan hba1c_level ada
        if (!formData.hba1c_level) {
            setError(formData.useEstimatedHbA1c 
                ? "Gagal mengestimasi HbA1c. Pastikan Gula Darah Saat Ini terisi dengan benar."
                : "Nilai HbA1c harus diisi.");
            return;
        }

        setIsLoading(true);
        setError('');

        try {
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
        <div className="bg-neutralBg min-h-screen">
            <Header />
            <main className="pt-6 pb-32 px-4 md:px-8 max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-textPrimary flex items-center">
                        <FaStethoscope className="mr-3 text-primaryRed" />
                        Prediksi Risiko Diabetes
                    </h1>
                    <p className="text-textSecondary mt-2">
                        Isi formulir di bawah ini untuk melihat prediksi risiko diabetes Anda berdasarkan data kesehatan.
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6 bg-cardWhite p-6 md:p-8 rounded-2xl shadow-md border border-lineGray">
                    {/* Informasi Umum */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-textPrimary border-b pb-2">Informasi Umum</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="age" className="block text-sm font-medium text-textPrimary mb-1">Usia (Tahun)</label>
                                <input 
                                    type="number" 
                                    name="age" 
                                    id="age" 
                                    value={formData.age} 
                                    onChange={handleChange} 
                                    required 
                                    className="mt-1 block w-full p-3 border border-lineGray rounded-lg shadow-sm focus:ring-primaryBlue focus:border-primaryBlue" 
                                    placeholder="Contoh: 55" 
                                />
                            </div>
                            <div>
                                <label htmlFor="gender" className="block text-sm font-medium text-textPrimary mb-1">Jenis Kelamin</label>
                                <select 
                                    name="gender" 
                                    id="gender" 
                                    value={formData.gender} 
                                    onChange={handleChange} 
                                    className="mt-1 block w-full p-3 border border-lineGray rounded-lg shadow-sm focus:ring-primaryBlue focus:border-primaryBlue"
                                >
                                    <option value="1">Pria</option>
                                    <option value="0">Wanita</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="berat" className="block text-sm font-medium text-textPrimary mb-1">Berat Badan (kg)</label>
                                <input 
                                    type="number" 
                                    step="0.1" 
                                    name="berat" 
                                    id="berat" 
                                    value={formData.berat} 
                                    onChange={handleChange} 
                                    required 
                                    className="mt-1 block w-full p-3 border border-lineGray rounded-lg shadow-sm focus:ring-primaryBlue focus:border-primaryBlue" 
                                    placeholder="Contoh: 70.5" 
                                />
                            </div>
                            <div>
                                <label htmlFor="tinggi" className="block text-sm font-medium text-textPrimary mb-1">Tinggi Badan (cm)</label>
                                <input 
                                    type="number" 
                                    step="0.1" 
                                    name="tinggi" 
                                    id="tinggi" 
                                    value={formData.tinggi} 
                                    onChange={handleChange} 
                                    required 
                                    className="mt-1 block w-full p-3 border border-lineGray rounded-lg shadow-sm focus:ring-primaryBlue focus:border-primaryBlue" 
                                    placeholder="Contoh: 165" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Data Gula Darah dan HbA1c */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-textPrimary border-b pb-2">Data Gula Darah</h2>
                        
                        <div>
                            <label htmlFor="blood_glucose" className="block text-sm font-medium text-textPrimary mb-1">Gula Darah Saat Ini (mg/dL)</label>
                            <input 
                                type="number" 
                                name="blood_glucose" 
                                id="blood_glucose" 
                                value={formData.blood_glucose} 
                                onChange={handleChange} 
                                required 
                                className="mt-1 block w-full p-3 border border-lineGray rounded-lg shadow-sm focus:ring-primaryBlue focus:border-primaryBlue" 
                                placeholder="Contoh: 140" 
                            />
                            <p className="mt-1 text-xs text-textSecondary">
                                Nilai normal: 70-100 mg/dL (puasa) atau kurang dari 140 mg/dL (2 jam setelah makan)
                            </p>
                        </div>

                        {/* Opsi HbA1c */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-start">
                                <input
                                    type="checkbox"
                                    id="useEstimatedHbA1c"
                                    name="useEstimatedHbA1c"
                                    checked={formData.useEstimatedHbA1c}
                                    onChange={handleChange}
                                    className="mt-1 mr-2 h-4 w-4 text-primaryBlue focus:ring-primaryBlue border-lineGray rounded"
                                />
                                <div className="flex-1">
                                    <label htmlFor="useEstimatedHbA1c" className="block text-sm font-medium text-textPrimary cursor-pointer">
                                        Gunakan estimasi HbA1c dari nilai gula darah
                                    </label>
                                    {formData.useEstimatedHbA1c && estimatedHbA1c && (
                                        <div className="mt-2 flex items-center text-sm text-primaryBlue">
                                            <FaCalculator className="mr-2" />
                                            <span>Estimasi HbA1c: <strong>{estimatedHbA1c}%</strong></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <button
                                type="button"
                                onClick={() => setShowHbA1cInfo(!showHbA1cInfo)}
                                className="mt-2 text-xs text-softBlue flex items-center hover:underline"
                            >
                                <FaInfoCircle className="mr-1" />
                                {showHbA1cInfo ? 'Sembunyikan' : 'Tampilkan'} informasi tentang HbA1c
                            </button>
                            
                            {showHbA1cInfo && (
                                <div className="mt-3 p-3 bg-white rounded-md border border-blue-100">
                                    <p className="text-xs text-textSecondary mb-2">
                                        <strong>HbA1c (Hemoglobin A1c)</strong> adalah tes darah yang mengukur persentase hemoglobin yang terikat dengan glukosa, mencerminkan rata-rata gula darah selama 2-3 bulan terakhir.
                                    </p>
                                    <div className="text-xs text-textSecondary space-y-1">
                                        <p><strong>Nilai normal:</strong> &lt;5.7%</p>
                                        <p><strong>Prediabetes:</strong> 5.7% - 6.4%</p>
                                        <p><strong>Diabetes:</strong> ≥6.5%</p>
                                    </div>
                                    <p className="text-xs text-amber-600 mt-2 flex items-start">
                                        <FaExclamationTriangle className="mr-1 mt-0.5 flex-shrink-0" />
                                        <span>Estimasi HbA1c dari gula darah saat ini memiliki akurasi terbatas dan tidak menggantikan tes laboratorium yang sebenarnya.</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {!formData.useEstimatedHbA1c && (
                            <div>
                                <label htmlFor="hba1c_level" className="block text-sm font-medium text-textPrimary mb-1">
                                    Kadar HbA1c (%)
                                    <span className="text-xs text-textSecondary ml-1">(jika Anda sudah mengetahui nilainya)</span>
                                </label>
                                <input 
                                    type="number" 
                                    step="0.1" 
                                    name="hba1c_level" 
                                    id="hba1c_level" 
                                    value={formData.hba1c_level} 
                                    onChange={handleChange} 
                                    required={!formData.useEstimatedHbA1c}
                                    className="mt-1 block w-full p-3 border border-lineGray rounded-lg shadow-sm focus:ring-primaryBlue focus:border-primaryBlue" 
                                    placeholder="Contoh: 6.5" 
                                />
                            </div>
                        )}
                    </div>

                    {/* Riwayat Kesehatan */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-textPrimary border-b pb-2">Riwayat Kesehatan</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="hypertension" className="block text-sm font-medium text-textPrimary mb-1">Riwayat Hipertensi</label>
                                <select 
                                    name="hypertension" 
                                    id="hypertension" 
                                    value={formData.hypertension} 
                                    onChange={handleChange} 
                                    className="mt-1 block w-full p-3 border border-lineGray rounded-lg shadow-sm focus:ring-primaryBlue focus:border-primaryBlue"
                                >
                                    <option value="0">Tidak</option>
                                    <option value="1">Ya</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="heart_disease" className="block text-sm font-medium text-textPrimary mb-1">Riwayat Penyakit Jantung</label>
                                <select 
                                    name="heart_disease" 
                                    id="heart_disease" 
                                    value={formData.heart_disease} 
                                    onChange={handleChange} 
                                    className="mt-1 block w-full p-3 border border-lineGray rounded-lg shadow-sm focus:ring-primaryBlue focus:border-primaryBlue"
                                >
                                    <option value="0">Tidak</option>
                                    <option value="1">Ya</option>
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="smoking_history" className="block text-sm font-medium text-textPrimary mb-1">Riwayat Merokok</label>
                            <select 
                                name="smoking_history" 
                                id="smoking_history" 
                                value={formData.smoking_history} 
                                onChange={handleChange} 
                                className="mt-1 block w-full p-3 border border-lineGray rounded-lg shadow-sm focus:ring-primaryBlue focus:border-primaryBlue"
                            >
                                <option value="0">Tidak Pernah</option>
                                <option value="1">Mantan Perokok</option>
                                <option value="2">Perokok Aktif</option>
                            </select>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <div className="flex items-start">
                            <FaExclamationTriangle className="text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                            <p className="text-xs text-textSecondary">
                                <strong>Disclaimer:</strong> Alat prediksi ini hanya untuk tujuan informasi dan tidak menggantikan diagnosis medis profesional. Hasil prediksi tidak boleh digunakan sebagai satu-satunya dasar untuk pengambilan keputusan medis. Selalu konsultasikan dengan dokter atau penyedia layanan kesehatan Anda untuk diagnosis dan perawatan yang tepat.
                            </p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={isLoading || !formData.hba1c_level}
                            className="w-full bg-primaryBlue text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-softBlue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primaryBlue disabled:bg-mutedGray disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <FaCheckCircle className="mr-2" />
                                    Dapatkan Prediksi Risiko
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-center text-errorRed">{error}</p>
                    </div>
                )}
            </main>
            <BottomNav />
        </div>
    );
}