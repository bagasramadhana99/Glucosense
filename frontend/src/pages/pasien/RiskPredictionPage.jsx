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
    useEstimatedHbA1c: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [estimatedHbA1c, setEstimatedHbA1c] = useState('');
  const [showHbA1cInfo, setShowHbA1cInfo] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        hba1c_level: checked ? estimatedHbA1c : prev.hba1c_level,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Estimasi HbA1c otomatis
  useEffect(() => {
    if (formData.blood_glucose && !isNaN(parseFloat(formData.blood_glucose))) {
      const glucose = parseFloat(formData.blood_glucose);
      if (glucose > 0) {
        const hbA1c = ((glucose + 46.7) / 28.7).toFixed(1);
        setEstimatedHbA1c(hbA1c);
        if (formData.useEstimatedHbA1c) {
          setFormData((prev) => ({ ...prev, hba1c_level: hbA1c }));
        }
      }
    } else {
      setEstimatedHbA1c('');
      if (formData.useEstimatedHbA1c) {
        setFormData((prev) => ({ ...prev, hba1c_level: '' }));
      }
    }
  }, [formData.blood_glucose, formData.useEstimatedHbA1c]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.hba1c_level) {
      setError(
        formData.useEstimatedHbA1c
          ? 'Gagal mengestimasi HbA1c. Pastikan Gula Darah Saat Ini valid.'
          : 'Kadar HbA1c wajib diisi.'
      );
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await apiClient.post('/ml/predict', formData);
      navigate('/pasien/hasil-prediksi', { state: { result: res.data } });
    } catch (err) {
      const msg = err.response?.data?.error || 'Terjadi kesalahan. Coba lagi.';
      setError(err.response?.status === 503 ? 'Layanan prediksi tidak tersedia.' : msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-neutralBg min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-6 pb-24 px-4 md:px-8 lg:px-12 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-textPrimary flex items-center">
            <FaStethoscope className="mr-3 text-primaryRed" />
            Prediksi Risiko Diabetes
          </h1>
          <p className="text-sm text-textSecondary mt-1">
            Isi data kesehatan Anda untuk melihat estimasi risiko diabetes.
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-cardWhite p-6 rounded-2xl border border-lineGray space-y-7">
          {/* Informasi Umum */}
          <section>
            <h2 className="text-lg font-semibold text-textPrimary pb-2 border-b border-lineGray">Informasi Umum</h2>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-textPrimary mb-1.5">Usia (tahun)</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  placeholder="55"
                  className="w-full p-3 border border-lineGray rounded-lg focus:ring-2 focus:ring-primaryBlue focus:border-primaryBlue transition-all"
                />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-textPrimary mb-1.5">Jenis Kelamin</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full p-3 border border-lineGray rounded-lg focus:ring-2 focus:ring-primaryBlue focus:border-primaryBlue"
                >
                  <option value="1">Pria</option>
                  <option value="0">Wanita</option>
                </select>
              </div>
              <div>
                <label htmlFor="berat" className="block text-sm font-medium text-textPrimary mb-1.5">Berat Badan (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  id="berat"
                  name="berat"
                  value={formData.berat}
                  onChange={handleChange}
                  required
                  placeholder="70.5"
                  className="w-full p-3 border border-lineGray rounded-lg focus:ring-2 focus:ring-primaryBlue focus:border-primaryBlue"
                />
              </div>
              <div>
                <label htmlFor="tinggi" className="block text-sm font-medium text-textPrimary mb-1.5">Tinggi Badan (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  id="tinggi"
                  name="tinggi"
                  value={formData.tinggi}
                  onChange={handleChange}
                  required
                  placeholder="165"
                  className="w-full p-3 border border-lineGray rounded-lg focus:ring-2 focus:ring-primaryBlue focus:border-primaryBlue"
                />
              </div>
            </div>
          </section>

          {/* Gula Darah & HbA1c */}
          <section>
            <h2 className="text-lg font-semibold text-textPrimary pb-2 border-b border-lineGray">Data Gula Darah</h2>
            <div className="mt-5 space-y-5">
              <div>
                <label htmlFor="blood_glucose" className="block text-sm font-medium text-textPrimary mb-1.5">
                  Gula Darah Saat Ini (mg/dL)
                </label>
                <input
                  type="number"
                  id="blood_glucose"
                  name="blood_glucose"
                  value={formData.blood_glucose}
                  onChange={handleChange}
                  required
                  placeholder="140"
                  className="w-full p-3 border border-lineGray rounded-lg focus:ring-2 focus:ring-primaryBlue focus:border-primaryBlue"
                />
              </div>

              {/* Opsi Estimasi HbA1c */}
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    name="useEstimatedHbA1c"
                    checked={formData.useEstimatedHbA1c}
                    onChange={handleChange}
                    className="mt-0.5 mr-3 h-4 w-4 text-primaryBlue rounded focus:ring-primaryBlue"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-textPrimary">Gunakan estimasi HbA1c dari gula darah</span>
                    {formData.useEstimatedHbA1c && estimatedHbA1c && (
                      <div className="mt-2 flex items-center text-sm text-primaryBlue">
                        <FaCalculator className="mr-2" />
                        <span>Estimasi HbA1c: <strong>{estimatedHbA1c}%</strong></span>
                      </div>
                    )}
                  </div>
                </label>

                <button
                  type="button"
                  onClick={() => setShowHbA1cInfo(!showHbA1cInfo)}
                  className="mt-3 text-xs text-primaryBlue flex items-center hover:underline"
                >
                  <FaInfoCircle className="mr-1" />
                  {showHbA1cInfo ? 'Sembunyikan' : 'Tampilkan'} info HbA1c
                </button>

                {showHbA1cInfo && (
                  <div className="mt-3 p-4 bg-white rounded-lg border border-blue-100 text-xs text-textSecondary space-y-2">
                    <p><strong>HbA1c</strong> = rata-rata gula darah 2–3 bulan terakhir.</p>
                    <p><strong>Normal:</strong> &lt;5.7%</p>
                    <p><strong>Prediabetes:</strong> 5.7% – 6.4%</p>
                    <p><strong>Diabetes:</strong> ≥6.5%</p>
                    <p className="flex items-start text-amber-600 mt-2">
                      <FaExclamationTriangle className="mr-1 mt-0.5 flex-shrink-0" />
                      <span>Estimasi ini bukan pengganti tes laboratorium.</span>
                    </p>
                  </div>
                )}
              </div>

              {!formData.useEstimatedHbA1c && (
                <div>
                  <label htmlFor="hba1c_level" className="block text-sm font-medium text-textPrimary mb-1.5">
                    Kadar HbA1c (%) <span className="text-xs text-textSecondary">(jika diketahui)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="hba1c_level"
                    name="hba1c_level"
                    value={formData.hba1c_level}
                    onChange={handleChange}
                    required={!formData.useEstimatedHbA1c}
                    placeholder="6.5"
                    className="w-full p-3 border border-lineGray rounded-lg focus:ring-2 focus:ring-primaryBlue focus:border-primaryBlue"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Riwayat Kesehatan */}
          <section>
            <h2 className="text-lg font-semibold text-textPrimary pb-2 border-b border-lineGray">Riwayat Kesehatan</h2>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="hypertension" className="block text-sm font-medium text-textPrimary mb-1.5">Hipertensi</label>
                <select
                  id="hypertension"
                  name="hypertension"
                  value={formData.hypertension}
                  onChange={handleChange}
                  className="w-full p-3 border border-lineGray rounded-lg focus:ring-2 focus:ring-primaryBlue focus:border-primaryBlue"
                >
                  <option value="0">Tidak</option>
                  <option value="1">Ya</option>
                </select>
              </div>
              <div>
                <label htmlFor="heart_disease" className="block text-sm font-medium text-textPrimary mb-1.5">Penyakit Jantung</label>
                <select
                  id="heart_disease"
                  name="heart_disease"
                  value={formData.heart_disease}
                  onChange={handleChange}
                  className="w-full p-3 border border-lineGray rounded-lg focus:ring-2 focus:ring-primaryBlue focus:border-primaryBlue"
                >
                  <option value="0">Tidak</option>
                  <option value="1">Ya</option>
                </select>
              </div>
            </div>
            <div className="mt-5">
              <label htmlFor="smoking_history" className="block text-sm font-medium text-textPrimary mb-1.5">Riwayat Merokok</label>
              <select
                id="smoking_history"
                name="smoking_history"
                value={formData.smoking_history}
                onChange={handleChange}
                className="w-full p-3 border border-lineGray rounded-lg focus:ring-2 focus:ring-primaryBlue focus:border-primaryBlue"
              >
                <option value="0">Tidak Pernah</option>
                <option value="1">Mantan Perokok</option>
                <option value="2">Perokok Aktif</option>
              </select>
            </div>
          </section>

          {/* Disclaimer */}
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200">
            <p className="text-xs text-textSecondary flex items-start">
              <FaExclamationTriangle className="text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Disclaimer:</strong> Prediksi ini hanya informasional. Bukan pengganti diagnosis dokter. 
                Selalu konsultasikan hasil dengan tenaga medis profesional.
              </span>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !formData.hba1c_level}
            className="w-full py-3 px-4 bg-primaryBlue hover:bg-blue-600 disabled:bg-mutedGray disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm flex items-center justify-center transition-all duration-200 hover:shadow"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
        </form>

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-50/50 rounded-xl border border-red-200">
            <p className="text-sm text-primaryRed text-center">{error}</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}