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
            const recommendationText = await getGeminiTrendRecommendation(result);
            setRecommendation(recommendationText);
        } catch (error) {
            console.error('Error fetching recommendation:', error);
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
            const nextDay = new Date(today);
            nextDay.setDate(today.getDate() + i);
            dates.push(nextDay);
        }
        return dates;
    }, []);

    const chartData = useMemo(() => {
        if (!result) return [];
        return result.predictions.map((value, index) => ({
            tanggalPendek: futureDates[index].toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short'
            }),
            'Prediksi Glukosa': value,
            tanggalLengkap: futureDates[index].toLocaleDateString('id-ID', {
                 weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })
        }));
    }, [result, futureDates]);

    const formatFullDate = (date) => {
        return date.toLocaleDateString('id-ID', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    const parseRecommendation = (text) => {
        if (!text) return { summary: '', analysis: [], recommendations: [], note: '' };
        
        const sections = {
            summary: '',
            analysis: [],
            recommendations: [],
            note: ''
        };
        
        const lines = text.split('\n').filter(line => line.trim());
        let currentSection = '';
        
        lines.forEach(line => {
            if (line.startsWith('Ringkasan AI:')) {
                currentSection = 'summary';
                sections.summary = line.replace('Ringkasan AI:', '').trim();
            } else if (line.startsWith('Analisis Tren:')) {
                currentSection = 'analysis';
            } else if (line.startsWith('Rekomendasi Utama:')) {
                currentSection = 'recommendations';
            } else if (line.startsWith('Catatan:')) {
                currentSection = 'note';
                sections.note = line.replace('Catatan:', '').trim();
            } else if (line.startsWith('-') && currentSection === 'analysis') {
                sections.analysis.push(line.substring(1).trim());
            } else if (/^\d+\./.test(line) && currentSection === 'recommendations') {
                sections.recommendations.push(line.replace(/^\d+\.\s*/, '').trim());
            } else if (currentSection === 'summary' && !line.startsWith('Ringkasan AI:')) {
                sections.summary += ' ' + line.trim();
            } else if (currentSection === 'note' && !line.startsWith('Catatan:')) {
                sections.note += ' ' + line.trim();
            }
        });
        
        return sections;
    };

    if (!result) {
        return null;
    }

    const parsedRecommendation = parseRecommendation(recommendation);

    return (
        <div className="bg-neutralBg min-h-screen">
            <Header />
            <main className="pt-6 pb-32 px-4 md:px-8">
                
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-textPrimary flex items-center">
                        <FaChartLine className="mr-3 text-primaryBlue" />
                        Hasil Prediksi Tren
                    </h1>
                    <button 
                        onClick={() => navigate('/pasien/prediksi')} 
                        className="text-sm text-textSecondary hover:text-softBlue flex items-center transition"
                    >
                        <FaArrowLeft className="mr-1" /> Kembali
                    </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Grafik dan Ringkasan */}
                    <div className="lg:col-span-2">
                        <div 
                            className={`bg-cardWhite p-6 rounded-2xl shadow-md border border-lineGray transform transition-all duration-500 ease-out ${
                                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                            }`}
                        >
                            <p className="text-center text-textSecondary mb-6">Berikut adalah prediksi tren kadar glukosa Anda untuk 5 hari ke depan, dimulai dari besok.</p>
                            
                            {/* Grafik */}
                            <div style={{ height: '300px', width: '100%' }}>
                                <ResponsiveContainer>
                                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3E5F8A" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#3E5F8A" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                        <XAxis dataKey="tanggalPendek" tick={{ fill: '#6B7280' }} />
                                        <YAxis domain={['auto', 'auto']} tick={{ fill: '#6B7280' }} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '10px', boxShadow: '2px 2px 10px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB' }}
                                            labelFormatter={(label) => {
                                                const fullData = chartData.find(d => d.tanggalPendek === label);
                                                return fullData ? fullData.tanggalLengkap : label;
                                            }}
                                        />
                                        <Legend />
                                        <Area 
                                            type="monotone" 
                                            dataKey="Prediksi Glukosa" 
                                            stroke="#1E3A5F" 
                                            fill="url(#chartGradient)" 
                                            strokeWidth={3}
                                            dot={{ stroke: '#1E3A5F', strokeWidth: 2, r: 5, fill: 'white' }}
                                            activeDot={{ r: 8, stroke: '#1E3A5F', fill: '#3E5F8A' }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Ringkasan Rata-rata */}
                            <div className="mt-6 p-4 bg-neutralBg rounded-xl text-center">
                                <p className="text-lg font-semibold text-textPrimary">Rata-rata Prediksi (5 Hari)</p>
                                <p className="text-3xl font-bold text-primaryBlue">{result.average_prediction} mg/dL</p>
                            </div>

                            {/* Detail Prediksi dengan Tanggal */}
                            <div className="mt-8">
                                <h3 className="text-lg font-bold text-textPrimary border-b border-lineGray pb-2 mb-4">Rincian Prediksi per Hari</h3>
                                <div className="space-y-3">
                                    {result.predictions.map((value, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row justify-between sm:items-center bg-neutralBg p-3 rounded-lg">
                                            <span className="font-medium text-textPrimary flex items-center mb-1 sm:mb-0">
                                                <FaCalendarDay className="mr-2 text-textSecondary" /> 
                                                {formatFullDate(futureDates[index])}
                                            </span>
                                            <strong className="text-primaryBlue text-lg">{value} mg/dL</strong>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rekomendasi AI - Desktop View */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div 
                            className={`bg-cardWhite p-6 rounded-2xl shadow-md border border-lineGray transform transition-all duration-500 ease-out ${
                                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                            }`}
                        >
                            <h2 className="text-xl font-bold text-textPrimary flex items-center mb-4">
                                <FaRobot className="mr-2 text-primaryBlue" />
                                Rekomendasi AI
                            </h2>
                            
                            {loadingRecommendation ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryBlue"></div>
                                </div>
                            ) : recommendation ? (
                                <div className="space-y-4">
                                    {/* Ringkasan AI */}
                                    <div className="bg-neutralBg p-4 rounded-lg">
                                        <h3 className="font-semibold text-textPrimary mb-2 flex items-center">
                                            <FaLightbulb className="mr-2 text-warningAmber" />
                                            Ringkasan AI
                                        </h3>
                                        <p className="text-textSecondary text-sm">{parsedRecommendation.summary}</p>
                                    </div>
                                    
                                    {/* Analisis Tren */}
                                    <div className="bg-neutralBg p-4 rounded-lg">
                                        <h3 className="font-semibold text-textPrimary mb-2">Analisis Tren</h3>
                                        <ul className="space-y-1">
                                            {parsedRecommendation.analysis.map((item, index) => (
                                                <li key={index} className="text-textSecondary text-sm flex items-start">
                                                    <span className="text-primaryBlue mr-2">•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    {/* Rekomendasi Utama */}
                                    <div className="bg-neutralBg p-4 rounded-lg">
                                        <h3 className="font-semibold text-textPrimary mb-2">Rekomendasi Utama</h3>
                                        <ol className="space-y-2">
                                            {parsedRecommendation.recommendations.map((item, index) => (
                                                <li key={index} className="text-textSecondary text-sm flex items-start">
                                                    <span className="text-primaryBlue font-semibold mr-2">{index + 1}.</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                    
                                    {/* Catatan */}
                                    {parsedRecommendation.note && (
                                        <div className="bg-infoBlue/10 p-3 rounded-lg border-l-4 border-infoBlue">
                                            <p className="text-textSecondary text-xs italic">{parsedRecommendation.note}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-textSecondary">Tidak dapat memuat rekomendasi AI saat ini.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tombol Rekomendasi AI - Mobile View */}
                <div className="lg:hidden mt-6">
                    <button
                        onClick={() => setShowRecommendation(!showRecommendation)}
                        className="w-full bg-cardWhite p-4 rounded-xl shadow-md border border-lineGray flex justify-between items-center transition-all duration-300"
                    >
                        <h2 className="text-lg font-bold text-textPrimary flex items-center">
                            <FaRobot className="mr-2 text-primaryBlue" />
                            Rekomendasi AI
                        </h2>
                        {showRecommendation ? (
                            <FaChevronUp className="text-primaryBlue" />
                        ) : (
                            <FaChevronDown className="text-primaryBlue" />
                        )}
                    </button>

                    {/* Rekomendasi AI Content - Mobile View */}
                    {showRecommendation && (
                        <div className="mt-4 bg-cardWhite p-6 rounded-xl shadow-md border border-lineGray">
                            {loadingRecommendation ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryBlue"></div>
                                </div>
                            ) : recommendation ? (
                                <div className="space-y-4">
                                    {/* Ringkasan AI */}
                                    <div className="bg-neutralBg p-4 rounded-lg">
                                        <h3 className="font-semibold text-textPrimary mb-2 flex items-center">
                                            <FaLightbulb className="mr-2 text-warningAmber" />
                                            Ringkasan AI
                                        </h3>
                                        <p className="text-textSecondary text-sm">{parsedRecommendation.summary}</p>
                                    </div>
                                    
                                    {/* Analisis Tren */}
                                    <div className="bg-neutralBg p-4 rounded-lg">
                                        <h3 className="font-semibold text-textPrimary mb-2">Analisis Tren</h3>
                                        <ul className="space-y-1">
                                            {parsedRecommendation.analysis.map((item, index) => (
                                                <li key={index} className="text-textSecondary text-sm flex items-start">
                                                    <span className="text-primaryBlue mr-2">•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    {/* Rekomendasi Utama */}
                                    <div className="bg-neutralBg p-4 rounded-lg">
                                        <h3 className="font-semibold text-textPrimary mb-2">Rekomendasi Utama</h3>
                                        <ol className="space-y-2">
                                            {parsedRecommendation.recommendations.map((item, index) => (
                                                <li key={index} className="text-textSecondary text-sm flex items-start">
                                                    <span className="text-primaryBlue font-semibold mr-2">{index + 1}.</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                    
                                    {/* Catatan */}
                                    {parsedRecommendation.note && (
                                        <div className="bg-infoBlue/10 p-3 rounded-lg border-l-4 border-infoBlue">
                                            <p className="text-textSecondary text-xs italic">{parsedRecommendation.note}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-textSecondary">Tidak dapat memuat rekomendasi AI saat ini.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <BottomNav />
        </div>
    );
}