import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import PatientSelectionModal from '../../components/PatientSelectionModal';
import apiClient from '../../api/axiosConfig';

// =========================
// Custom Hook: useAnimatedValue
// =========================
const useAnimatedValue = (targetValue, duration = 500) => {
  const [currentValue, setCurrentValue] = useState(targetValue);
  const frameRef = useRef();
  const currentRef = useRef(currentValue);

  useEffect(() => {
    currentRef.current = currentValue;
  }, [currentValue]);

  useEffect(() => {
    const startValue = currentRef.current;
    const diff = targetValue - startValue;
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const newValue = startValue + diff * progress;
      setCurrentValue(Math.round(newValue));

      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [targetValue, duration]);

  return currentValue;
};

// =========================
// CircularGauge Component
// =========================
const CircularGauge = ({ value, maxValue, label, unit }) => {
  const animatedValue = useAnimatedValue(value, 800);
  const percentage = (animatedValue / maxValue) * 100;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // === Warna berdasarkan label dan nilai ===
  const getColor = (val) => {
    if (label === "Glukosa") {
      if (val < 70) return "text-errorRed stroke-errorRed";
      if (val > 200) return "text-warningAmber stroke-warningAmber";
      return "text-successGreen stroke-successGreen";
    } else {
      if (val < 60 || val > 100) return "text-warningAmber stroke-warningAmber";
      return "text-successGreen stroke-successGreen";
    }
  };

  const colorClass = getColor(animatedValue);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx={50}
            cy={50}
            r={radius}
            fill="none"
            className="stroke-lineGray"
            strokeWidth={8}
          />
          <circle
            cx={50}
            cy={50}
            r={radius}
            fill="none"
            className={`${colorClass}`}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 0.6s ease, stroke 0.4s ease",
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-textPrimary">
            {animatedValue}
          </span>
          <span className="text-sm text-textSecondary mt-1">{unit}</span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="font-semibold text-textPrimary">{label}</p>
        {label === "Glukosa" && (
          <p
            className={`text-xs mt-1 font-medium ${
              animatedValue < 70
                ? "text-errorRed"
                : animatedValue > 200
                ? "text-warningAmber"
                : "text-successGreen"
            }`}
          >
            {animatedValue < 70
              ? "Rendah"
              : animatedValue > 200
              ? "Tinggi"
              : "Normal"}
          </p>
        )}
        {label === "Detak Jantung" && (
          <p
            className={`text-xs mt-1 font-medium ${
              animatedValue < 60 || animatedValue > 100
                ? "text-warningAmber"
                : "text-successGreen"
            }`}
          >
            {animatedValue < 60 || animatedValue > 100
              ? "Perlu Perhatian"
              : "Normal"}
          </p>
        )}
      </div>
    </div>
  );
};

// =========================
// Komponen Utama: Monitoring
// =========================
const Monitoring = () => {
  const [glucoseLevel, setGlucoseLevel] = useState(0);
  const [heartRate, setHeartRate] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // === Ambil data sensor terbaru ===
  useEffect(() => {
    const fetchData = async () => {
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
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const saveDataToApi = async ({ name }) => {
    setIsSaving(true);
    setIsModalOpen(false);
    try {
      const res = await apiClient.post('/monitoring/save', {
        name,
        glucose_level: glucoseLevel,
        heart_rate: heartRate,
      });
      if (res.status === 201) {
        alert("✅ Data pemeriksaan berhasil disimpan!");
      } else {
        alert("⚠️ Gagal menyimpan data.");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-neutralBg">
      <Sidebar activePage="Monitoring" />

      <main className="flex-1 p-8 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-primaryBlue">
            Live Monitoring
          </h1>
          <div className="text-sm text-mutedGray">
            {lastUpdated
              ? `Terakhir diperbarui: ${lastUpdated.toLocaleTimeString("id-ID")}`
              : "Memuat data..."}
          </div>
        </div>

        {/* Gauges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-cardWhite rounded-2xl shadow-md p-8 border border-lineGray hover:shadow-lg transition-all">
            <h2 className="text-xl font-semibold text-textPrimary mb-6">
              Glukosa
            </h2>
            <CircularGauge
              value={glucoseLevel}
              maxValue={200}
              label="Glukosa"
              unit="mg/dL"
            />
          </div>

          <div className="bg-cardWhite rounded-2xl shadow-md p-8 border border-lineGray hover:shadow-lg transition-all">
            <h2 className="text-xl font-semibold text-textPrimary mb-6">
              Detak Jantung
            </h2>
            <CircularGauge
              value={heartRate}
              maxValue={120}
              label="Detak Jantung"
              unit="bpm"
            />
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="flex justify-center lg:justify-start mb-10">
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isSaving}
            className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ease-in-out focus:outline-none ${
              isSaving
                ? "bg-softBlue text-white opacity-70 cursor-not-allowed"
                : "bg-primaryBlue text-white hover:bg-softBlue hover:shadow-lg"
            }`}
          >
            {isSaving ? "Menyimpan..." : "Simpan Hasil Pemeriksaan"}
          </button>
        </div>

      </main>

      <PatientSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(selectedPatient) =>
          saveDataToApi({ name: selectedPatient.name })
        }
      />
    </div>
  );
};

export default Monitoring;
