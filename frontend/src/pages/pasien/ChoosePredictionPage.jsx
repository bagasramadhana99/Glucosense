import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { FaArrowRight, FaChartLine, FaHeartbeat, FaInfoCircle } from 'react-icons/fa';

// Konstanta untuk deskripsi
const PREDICTION_DESCRIPTIONS = {
  risk: 'Ketahui estimasi risiko Anda terhadap diabetes untuk deteksi dini.',
  trend: 'Lihat proyeksi kadar gula darah Anda untuk 5 hari ke depan.'
};

// Komponen Visualisasi Sederhana
const SimpleChart = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <div className="flex items-end justify-between h-12 w-full px-1">
      <div className={`w-2 bg-primaryBlue/30 rounded-t transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`} style={{height: '40%'}}></div>
      <div className={`w-2 bg-primaryBlue/40 rounded-t transition-opacity duration-700 delay-100 ${mounted ? 'opacity-100' : 'opacity-0'}`} style={{height: '60%'}}></div>
      <div className={`w-2 bg-primaryBlue/50 rounded-t transition-opacity duration-700 delay-200 ${mounted ? 'opacity-100' : 'opacity-0'}`} style={{height: '45%'}}></div>
      <div className={`w-2 bg-primaryBlue/60 rounded-t transition-opacity duration-700 delay-300 ${mounted ? 'opacity-100' : 'opacity-0'}`} style={{height: '70%'}}></div>
      <div className={`w-2 bg-primaryBlue/70 rounded-t transition-opacity duration-700 delay-400 ${mounted ? 'opacity-100' : 'opacity-0'}`} style={{height: '55%'}}></div>
      <div className={`w-2 bg-primaryBlue/80 rounded-t transition-opacity duration-700 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`} style={{height: '65%'}}></div>
      <div className={`w-2 bg-primaryBlue rounded-t transition-opacity duration-700 delay-600 ${mounted ? 'opacity-100' : 'opacity-0'}`} style={{height: '80%'}}></div>
    </div>
  );
};

const RiskMeter = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <div className="relative h-12 w-12">
      <svg className="transform -rotate-90 w-12 h-12">
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="none" className="text-lineGray"></circle>
        <circle 
          cx="24" 
          cy="24" 
          r="20" 
          stroke="currentColor" 
          strokeWidth="4" 
          fill="none" 
          strokeDasharray="125.6" 
          strokeDashoffset={mounted ? "31.4" : "125.6"} 
          className="text-primaryRed transition-all duration-1000 ease-out"
        ></circle>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-primaryRed">75%</span>
      </div>
    </div>
  );
};

// Komponen Card Prediksi
const PredictionCard = ({ 
  title, 
  description, 
  icon, 
  onClick, 
  isPrimary = false,
  visual 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="bg-cardWhite p-6 rounded-2xl shadow-sm border border-lineGray transition-all duration-300 hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className={`p-3 rounded-xl mr-4 transition-transform duration-300 ${
            isPrimary 
              ? "bg-red-100 text-primaryRed" 
              : "bg-blue-100 text-primaryBlue"
          } ${isHovered ? 'scale-105' : ''}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-textPrimary">{title}</h3>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
              isPrimary 
                ? "bg-red-100 text-primaryRed" 
                : "bg-blue-100 text-primaryBlue"
            }`}>
              {isPrimary ? "Populer" : "Baru"}
            </span>
          </div>
        </div>
        <div className="opacity-20">
          {visual}
        </div>
      </div>
      
      <p className="text-textSecondary mb-6">{description}</p>
      
      <button
        onClick={onClick}
        className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-all ${
          isPrimary 
            ? "bg-primaryRed hover:bg-red-600 text-white" 
            : "bg-primaryBlue hover:bg-blue-600 text-white"
        }`}
      >
        Mulai Prediksi
        <FaArrowRight className={`ml-2 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
      </button>
    </div>
  );
};

// Komponen Info Ringan
const InfoTip = ({ title, description }) => (
  <div className="bg-cardWhite p-4 rounded-xl border border-lineGray">
    <div className="flex items-start">
      <div className="p-2 rounded-lg bg-softBlue/10 text-primaryBlue mr-3 flex-shrink-0">
        <FaInfoCircle size={16} />
      </div>
      <div>
        <h4 className="font-semibold text-textPrimary text-sm">{title}</h4>
        <p className="text-xs text-textSecondary mt-1">{description}</p>
      </div>
    </div>
  </div>
);

export default function ChoosePredictionPage() {
  const navigate = useNavigate();

  // Event handlers dengan useCallback
  const handleRiskPrediction = useCallback(() => {
    navigate('/pasien/prediksi-risiko');
  }, [navigate]);

  const handleTrendPrediction = useCallback(() => {
    navigate('/pasien/prediksi-tren');
  }, [navigate]);

  return (
    <div className="bg-neutralBg min-h-screen">
      <Header />
      <main className="pt-6 pb-32 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-textPrimary">Lakukan Prediksi</h1>
          <p className="text-textSecondary mt-2 text-sm md:text-base">
            Pilih jenis analisis kesehatan yang ingin Anda lakukan berdasarkan data pemeriksaan Anda.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Card untuk Prediksi Risiko */}
          <PredictionCard 
            title="Prediksi Risiko"
            description={PREDICTION_DESCRIPTIONS.risk}
            icon={<FaHeartbeat size={24} />}
            onClick={handleRiskPrediction}
            isPrimary={true}
            visual={<RiskMeter />}
          />

          {/* Card untuk Prediksi Tren */}
          <PredictionCard 
            title="Prediksi Tren"
            description={PREDICTION_DESCRIPTIONS.trend}
            icon={<FaChartLine size={24} />}
            onClick={handleTrendPrediction}
            isPrimary={false}
            visual={<SimpleChart />}
          />
        </div>

        {/* Info Tips Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoTip 
            title="Prediksi Risiko"
            description="Menggunakan data pemeriksaan Anda untuk mengidentifikasi potensi risiko diabetes."
          />
          <InfoTip 
            title="Prediksi Tren"
            description="Menganalisis pola data historis untuk memproyeksikan kadar gula darah masa depan."
          />
        </div>

        {/* Catatan Penting */}
        <div className="mt-8 p-4 bg-softBlue/5 rounded-xl border border-softBlue/20">
          <div className="flex items-start">
            <FaInfoCircle className="text-primaryBlue mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-textPrimary text-sm mb-1">Catatan Penting</h4>
              <p className="text-xs text-textSecondary">
                Hasil prediksi ini bersifat informasional dan bukan pengganti diagnosis medis profesional. 
                Selalu konsultasikan dengan dokter Anda untuk keputusan kesehatan.
              </p>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}