import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { FaChartLine, FaArrowLeft, FaCalendarDay, FaRobot, FaLightbulb, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getGeminiTrendRecommendation } from '../../api/getGeminiTrendRecommendation';

export default function TrendResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);

  const result = location.state?.result;

  useEffect(() => {
    if (!result) {
      navigate('/pasien/prediksi-tren');
    } else {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [result, navigate]);

  const fetchRecommendation = useCallback(async () => {
    setLoadingRecommendation(true);
    try {
      const text = await getGeminiTrendRecommendation(result);
      setRecommendation(text);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingRecommendation(false);
    }
  }, [result]);

  useEffect(() => {
    if (result && isVisible) {
      fetchRecommendation();
    }
  }, [result, isVisible, fetchRecommendation]);

  const futureDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 5; i++) {
      const next = new Date(today);
      next.setDate(today.getDate() + i);
      dates.push(next);
    }
    return dates;
  }, []);

  const chartData = useMemo(() => {
    if (!result) return [];
    return result.predictions.map((value, i) => ({
      tanggalPendek: futureDates[i].toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      'Prediksi Glukosa': Math.round(value),
      tanggalLengkap: futureDates[i].toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    }));
  }, [result, futureDates]);

  const formatFullDate = (date) => {
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const parseRecommendation = (text) => {
    if (!text) return { summary: '', analysis: [], recommendations: [], note: '' };
    const sections = { summary: '', analysis: [], recommendations: [], note: '' };
    const lines = text.split('\n').filter(Boolean);
    let current = '';

    lines.forEach(line => {
      if (line.startsWith('Ringkasan AI:')) {
        current = 'summary';
        sections.summary = line.replace('Ringkasan AI:', '').trim();
      } else if (line.startsWith('Analisis Tren:')) {
        current = 'analysis';
      } else if (line.startsWith('Rekomendasi Utama:')) {
        current = 'recommendations';
      } else if (line.startsWith('Catatan:')) {
        current = 'note';
        sections.note = line.replace('Catatan:', '').trim();
      } else if (line.startsWith('-') && current === 'analysis') {
        sections.analysis.push(line.slice(1).trim());
      } else if (/^\d+\./.test(line) && current === 'recommendations') {
        sections.recommendations.push(line.replace(/^\d+\.\s*/, '').trim());
      } else if (current === 'summary' && !line.startsWith('Ringkasan AI:')) {
        sections.summary += ' ' + line.trim();
      } else if (current === 'note' && !line.startsWith('Catatan:')) {
        sections.note += ' ' + line.trim();
      }
    });

    return sections;
  };

  if (!result) return null;
  const parsed = parseRecommendation(recommendation);

  return (
    <div className="bg-neutralBg min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-6 pb-24 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <h1 className="text-2xl font-bold text-textPrimary flex items-center">
            <FaChartLine className="mr-3 text-primaryBlue" />
            Hasil Prediksi Tren
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-textSecondary hover:text-primaryBlue flex items-center transition-colors"
          >
            <FaArrowLeft className="mr-1.5" /> Kembali
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grafik & Prediksi */}
          <div className="lg:col-span-2">
            <div
              className={`bg-cardWhite p-6 rounded-2xl border border-lineGray transition-all duration-500 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <p className="text-center text-sm text-textSecondary mb-6">
                Prediksi tren glukosa untuk 5 hari ke depan, mulai dari besok.
              </p>

              {/* Chart */}
              <div className="h-64 md:h-80 w-full mb-6">
                <ResponsiveContainer>
                  <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="tanggalPendek" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                      labelFormatter={(v) => chartData.find(d => d.tanggalPendek === v)?.tanggalLengkap || v}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="Prediksi Glukosa"
                      stroke="#1d4ed8"
                      fill="url(#trendGrad)"
                      strokeWidth={3}
                      dot={{ fill: 'white', stroke: '#1d4ed8', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Rata-rata */}
              <div className="p-5 bg-neutralBg/50 rounded-xl text-center mb-8">
                <p className="text-base font-semibold text-textPrimary">Rata-rata 5 Hari</p>
                <p className="text-3xl font-bold text-primaryBlue">{Math.round(result.average_prediction)} mg/dL</p>
              </div>

              {/* Detail per Hari */}
              <div>
                <h3 className="text-lg font-bold text-textPrimary pb-2 border-b border-lineGray mb-4">
                  Rincian per Hari
                </h3>
                <div className="space-y-3">
                  {result.predictions.map((value, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-neutralBg/50 rounded-xl border border-lineGray"
                    >
                      <span className="font-medium text-textPrimary flex items-center text-sm">
                        <FaCalendarDay className="mr-2 text-textSecondary" />
                        {formatFullDate(futureDates[i])}
                      </span>
                      <strong className="text-lg text-primaryBlue mt-1 sm:mt-0">
                        {Math.round(value)} mg/dL
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Rekomendasi AI - Desktop */}
          <div className="hidden lg:block">
            <div
              className={`bg-cardWhite p-6 rounded-2xl border border-lineGray transition-all duration-500 ease-out delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <h2 className="text-lg font-bold text-textPrimary flex items-center mb-5">
                <FaRobot className="mr-2 text-primaryBlue" />
                Rekomendasi
              </h2>

              {loadingRecommendation ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primaryBlue"></div>
                </div>
              ) : recommendation ? (
                <div className="space-y-4 text-sm">
                  {parsed.summary && (
                    <div className="p-4 bg-neutralBg/50 rounded-xl">
                      <h3 className="font-semibold text-textPrimary mb-2 flex items-center">
                        <FaLightbulb className="mr-2 text-amber-500" />
                        Ringkasan
                      </h3>
                      <p className="text-textSecondary leading-relaxed">{parsed.summary}</p>
                    </div>
                  )}
                  {parsed.analysis.length > 0 && (
                    <div className="p-4 bg-neutralBg/50 rounded-xl">
                      <h3 className="font-semibold text-textPrimary mb-2">Analisis Tren</h3>
                      <ul className="space-y-1.5">
                        {parsed.analysis.map((item, i) => (
                          <li key={i} className="flex text-textSecondary">
                            <span className="text-primaryBlue mr-2">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {parsed.recommendations.length > 0 && (
                    <div className="p-4 bg-neutralBg/50 rounded-xl">
                      <h3 className="font-semibold text-textPrimary mb-2">Rekomendasi</h3>
                      <ol className="space-y-2">
                        {parsed.recommendations.map((item, i) => (
                          <li key={i} className="flex text-textSecondary">
                            <span className="text-primaryBlue font-semibold mr-2">{i + 1}.</span>
                            {item}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {parsed.note && (
                    <div className="p-3 bg-blue-50/50 rounded-lg border-l-4 border-primaryBlue">
                      <p className="text-xs text-textSecondary italic">{parsed.note}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-sm text-textSecondary py-8">
                  Tidak dapat memuat rekomendasi.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mobile: Accordion Rekomendasi */}
        <div className="lg:hidden mt-6">
          <button
            onClick={() => setShowRecommendation(!showRecommendation)}
            className="w-full p-4 bg-cardWhite rounded-xl border border-lineGray flex justify-between items-center transition-all hover:shadow"
          >
            <h2 className="text-lg font-bold text-textPrimary flex items-center">
              <FaRobot className="mr-2 text-primaryBlue" />
              Rekomendasi
            </h2>
            {showRecommendation ? (
              <FaChevronUp className="text-primaryBlue" />
            ) : (
              <FaChevronDown className="text-primaryBlue" />
            )}
          </button>

          {showRecommendation && (
            <div className="mt-4 p-6 bg-cardWhite rounded-xl border border-lineGray">
              {loadingRecommendation ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primaryBlue"></div>
                </div>
              ) : recommendation ? (
                <div className="space-y-4 text-sm">
                  {parsed.summary && (
                    <div className="p-4 bg-neutralBg/50 rounded-xl">
                      <h3 className="font-semibold text-textPrimary mb-2 flex items-center">
                        <FaLightbulb className="mr-2 text-amber-500" />
                        Ringkasan
                      </h3>
                      <p className="text-textSecondary leading-relaxed">{parsed.summary}</p>
                    </div>
                  )}
                  {parsed.analysis.length > 0 && (
                    <div className="p-4 bg-neutralBg/50 rounded-xl">
                      <h3 className="font-semibold text-textPrimary mb-2">Analisis Tren</h3>
                      <ul className="space-y-1.5">
                        {parsed.analysis.map((item, i) => (
                          <li key={i} className="flex text-textSecondary">
                            <span className="text-primaryBlue mr-2">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {parsed.recommendations.length > 0 && (
                    <div className="p-4 bg-neutralBg/50 rounded-xl">
                      <h3 className="font-semibold text-textPrimary mb-2">Rekomendasi</h3>
                      <ol className="space-y-2">
                        {parsed.recommendations.map((item, i) => (
                          <li key={i} className="flex text-textSecondary">
                            <span className="text-primaryBlue font-semibold mr-2">{i + 1}.</span>
                            {item}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {parsed.note && (
                    <div className="p-3 bg-blue-50/50 rounded-lg border-l-4 border-primaryBlue">
                      <p className="text-xs text-textSecondary italic">{parsed.note}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-sm text-textSecondary py-8">
                  Tidak dapat memuat rekomendasi.
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}