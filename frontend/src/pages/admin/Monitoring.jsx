import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import PatientSelectionModal from '../../components/PatientSelectionModal';
import apiClient from '../../api/axiosConfig';

// Custom hook animasi angka naik-turun
const useAnimatedValue = (targetValue, duration = 500) => {
  const [currentValue, setCurrentValue] = useState(targetValue);
  const frameRef = useRef();

  useEffect(() => {
    const startValue = currentValue;
    const difference = targetValue - startValue;
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const newValue = startValue + difference * progress;

      setCurrentValue(Math.round(newValue));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [targetValue, duration]);

  return currentValue;
};

// CircularGauge component
const CircularGauge = ({ value, maxValue, label, unit }) => {
  const animatedValue = useAnimatedValue(value, 800);
  const percentage = (animatedValue / maxValue) * 100;
  const strokeDasharray = 2 * Math.PI * 45;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

  const getGlucoseColor = (val) => {
    if (val < 70) return "#ef4444";
    if (val > 140) return "#f59e0b";
    return "#10b981";
  };

  const getHeartRateColor = (val) => {
    if (val < 60 || val > 100) return "#f59e0b";
    return "#10b981";
  };

  const color = label === "Glukosa" ? getGlucoseColor(animatedValue) : getHeartRateColor(animatedValue);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx={50} cy={50} r={45} fill="none" stroke="#e5e7eb" strokeWidth={8} />
          <circle
            cx={50} cy={50} r={45}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-800">{animatedValue}</span>
          <span className="text-sm text-gray-500 mt-1">{unit}</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="font-semibold text-gray-700">{label}</p>
        {label === "Glukosa" && (
          <p className={`text-xs mt-1 font-medium ${color === "#ef4444" ? "text-red-600" : color === "#f59e0b" ? "text-amber-600" : "text-green-600"}`}>
            {animatedValue < 70 ? "Rendah" : animatedValue > 140 ? "Tinggi" : "Normal"}
          </p>
        )}
        {label === "Detak Jantung" && (
          <p className={`text-xs mt-1 font-medium ${color === "#f59e0b" ? "text-amber-600" : "text-green-600"}`}>
            {animatedValue < 60 || animatedValue > 100 ? "Perlu Perhatian" : "Normal"}
          </p>
        )}
      </div>
    </div>
  );
};

// Komponen utama Monitoring
const Monitoring = () => {
  const [glucoseLevel, setGlucoseLevel] = useState(0);
  const [heartRate, setHeartRate] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        const res = await apiClient.get('/sensors/latest');
        const { glucose, heart_rate } = res.data;
        setGlucoseLevel(parseFloat(glucose) || 0);
        setHeartRate(parseFloat(heart_rate) || 0);
        setLastUpdated(new Date());
      } catch (err) {
        console.error("Gagal mengambil data sensor terbaru:", err);
      }
    };

    fetchLatestData();
    const intervalId = setInterval(fetchLatestData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const saveDataToApi = async ({ name }) => {
    setIsSaving(true);
    setIsModalOpen(false);
    try {
      const response = await apiClient.post('/monitoring/save', {
        name,
        glucose_level: glucoseLevel,
        heart_rate: heartRate
      });
      if (response.status === 201) {
        alert('Hasil pemeriksaan berhasil disimpan!');
      } else {
        alert('Gagal menyimpan: ' + (response.data.message || 'Terjadi kesalahan.'));
      }
    } catch (err) {
      console.error('Gagal menyimpan:', err);
      alert('Terjadi kesalahan saat mencoba menyimpan data!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f8ff]">
      <Sidebar activePage="Monitoring" />
      <main className="flex-1 p-8 flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Live Monitoring</h1>
          <div className="text-sm text-gray-500">
            {lastUpdated ? `Terakhir diperbarui: ${lastUpdated.toLocaleTimeString('id-ID')}` : 'Memuat data...'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-6 text-center lg:text-left">Glukosa</h2>
            <CircularGauge value={glucoseLevel} maxValue={200} label="Glukosa" unit="mg/dL" />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-6 text-center lg:text-left">Detak Jantung</h2>
            <CircularGauge value={heartRate} maxValue={120} label="Detak Jantung" unit="bpm" />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isSaving}
            className={`px-8 py-3 border-2 border-indigo-600 text-indigo-600 rounded-full font-semibold text-base transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400 ${isSaving ? 'opacity-60 cursor-not-allowed bg-indigo-100' : 'hover:bg-indigo-600 hover:text-white hover:shadow-lg'}`}
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Hasil Pemeriksaan'}
          </button>
        </div>

        <footer className="mt-auto text-center text-gray-500 text-sm py-4">
          copyright © Glucosense 2025
        </footer>
      </main>

      <PatientSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(selectedPatient) => saveDataToApi({ name: selectedPatient.name })}
      />
    </div>
  );
};

export default Monitoring;
