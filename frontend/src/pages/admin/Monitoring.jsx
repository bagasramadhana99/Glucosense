import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import PatientSelectionModal from '../../components/PatientSelectionModal';
import { FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import apiClient from '../../api/axiosConfig';

// =========================
// Custom Hook: useAnimatedValue (AKURAT, TANPA PEMBULATAN)
// =========================
const useAnimatedValue = (targetValue, duration = 600) => {
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
      const eased = easeOutCubic(progress);
      const newValue = startValue + diff * eased;
      setCurrentValue(newValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        // Pastikan nilai akhir 100% sama dengan target
        setCurrentValue(targetValue);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [targetValue, duration]);

  // Format angka: tetap 1 desimal jika ada, tanpa pembulatan berlebih
  return Number(currentValue.toFixed(2));
};

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

// =========================
// CircularGauge Component (AKURAT)
// =========================
const CircularGauge = ({ value, maxValue, label, unit }) => {
  const animatedValue = useAnimatedValue(value);
  const percentage = (animatedValue / maxValue) * 100;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Format angka: tampilkan 1 desimal jika ada, tanpa pembulatan
  const displayValue = animatedValue % 1 === 0 ? animatedValue : animatedValue.toFixed(1);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx={50} cy={50} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={7} />
          <circle
            cx={50}
            cy={50}
            r={radius}
            fill="none"
            stroke="#1E3A5F"
            strokeWidth={7}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-textPrimary">{displayValue}</span>
          <span className="text-xs text-textSecondary mt-1">{unit}</span>
        </div>
      </div>

      <p className="mt-3 text-sm font-semibold text-textPrimary">{label}</p>
    </div>
  );
};

// =========================
// Reusable Modal (Sama seperti EditPasien)
// =========================
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
                Ya, Simpan
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

// =========================
// Main Component: Monitoring
// =========================
const Monitoring = () => {
  const [glucoseLevel, setGlucoseLevel] = useState(0);
  const [heartRate, setHeartRate] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal States
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  // === Fetch real-time sensor data (TANPA PEMBULATAN) ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/sensors/latest');
        const { glucose, heart_rate } = res.data;

        // Gunakan Number() agar desimal tetap terjaga
        const glucoseVal = Number(glucose) || 0;
        const heartRateVal = Number(heart_rate) || 0;

        setGlucoseLevel(glucoseVal);
        setHeartRate(heartRateVal);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Gagal mengambil data sensor:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  // === Handle Save ===
  const handleSave = async () => {
    if (!selectedPatient) return;

    setShowConfirm(false);
    setIsSaving(true);

    try {
      await apiClient.post('/monitoring/save', {
        name: selectedPatient.name,
        glucose_level: glucoseLevel,
        heart_rate: heartRate,
      });
      setShowSuccess(true);
    } catch (err) {
      console.error('Gagal menyimpan data:', err);
      const msg = err.response?.data?.message || 'Gagal menyimpan hasil pemeriksaan.';
      setErrorMessage(msg);
      setShowError(true);
    } finally {
      setIsSaving(false);
      setIsPatientModalOpen(false);
    }
  };

  // === Format Time ===
  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="flex h-screen bg-neutralBg font-sans">
      <Sidebar activePage="Monitoring" />

      <main className="flex-1 p-5 md:p-7 overflow-y-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-textPrimary">Live Monitoring</h1>
          <p className="text-sm text-textSecondary mt-1">
            Pantau glukosa dan detak jantung secara real-time
          </p>
        </header>

        {/* Last Updated */}
        <div className="mb-5 text-right">
          <p className="text-xs text-textSecondary">
            Terakhir diperbarui:{' '}
            <span className="font-medium text-primaryBlue">
              {lastUpdated ? formatTime(lastUpdated) : 'Memuat...'}
            </span>
          </p>
        </div>

        {/* Gauges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <div className="bg-cardWhite p-6 rounded-xl shadow-sm border border-lineGray hover:shadow-md transition-shadow">
            <h2 className="text-base font-semibold text-textPrimary mb-4">Glukosa Darah</h2>
            <CircularGauge value={glucoseLevel} maxValue={300} label="Glukosa" unit="mg/dL" />
          </div>

          <div className="bg-cardWhite p-6 rounded-xl shadow-sm border border-lineGray hover:shadow-md transition-shadow">
            <h2 className="text-base font-semibold text-textPrimary mb-4">Detak Jantung</h2>
            <CircularGauge value={heartRate} maxValue={180} label="Detak Jantung" unit="bpm" />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsPatientModalOpen(true)}
            disabled={isSaving}
            className={`px-7 py-2.5 rounded-full font-medium text-sm transition-all duration-200 flex items-center gap-2
              ${isSaving
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-primaryBlue text-white hover:bg-[#1a3355] hover:shadow-md active:scale-95'
              }`}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Simpan Hasil Pemeriksaan'
            )}
          </button>
        </div>
      </main>

      {/* === MODALS === */}
      {/* Patient Selection */}
      <PatientSelectionModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSave={(patient) => {
          setSelectedPatient(patient);
          setIsPatientModalOpen(false);
          setShowConfirm(true);
        }}
      />

      {/* Confirm Save */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Simpan Hasil?"
        message={`Simpan hasil pemeriksaan untuk pasien: ${selectedPatient?.name || ''}?`}
        type="confirm"
        onConfirm={handleSave}
      />

      {/* Success */}
      <Modal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Berhasil!"
        message="Hasil pemeriksaan berhasil disimpan."
        type="success"
      />

      {/* Error */}
      <Modal
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="Gagal"
        message={errorMessage}
        type="error"
      />
    </div>
  );
};

export default Monitoring;