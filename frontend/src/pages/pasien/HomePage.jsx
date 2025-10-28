import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Ditambahkan untuk navigasi
import apiClient from '../../api/axiosConfig';
import { FaChevronDown, FaLightbulb, FaNewspaper, FaHeartbeat } from 'react-icons/fa'; // Ditambahkan ikon
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';

// =========================
// KOMPONEN BARU: Riwayat Pemeriksaan Terakhir
// =========================
const LatestCheckup = ({ checkup }) => {
    // Format tanggal agar mudah dibaca dan menampilkan waktu UTC
    const formattedDate = new Date(checkup.timestamp).toLocaleDateString('id-ID', {
        timeZone: 'UTC',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const navigate = useNavigate();

    return (
        <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-200 mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <FaHeartbeat className="text-red-500 mr-2" />
                    Pemeriksaan Terakhir
                </h2>
                <button
                    onClick={() => navigate('/pasien/riwayat')}
                    className="text-sm text-indigo-600 hover:underline font-semibold"
                >
                    Lihat Semua
                </button>
            </div>
            <p className="text-sm text-gray-500 mb-3">{formattedDate} (UTC)</p>
            <div className="flex justify-between items-center text-gray-700">
                <div>
                    <span className="text-sm">Glukosa:</span>
                    <p className="font-bold text-xl">{checkup.glucose_level} <span className="text-sm font-normal">mg/dL</span></p>
                </div>
                <div className="text-right">
                    <span className="text-sm">Detak Jantung:</span>
                    <p className="font-bold text-xl">{checkup.heart_rate} <span className="text-sm font-normal">bpm</span></p>
                </div>
            </div>
        </div>
    );
};


// Komponen Accordion untuk FAQ (FunFactItem) - tidak diubah
const FunFactItem = ({ fact, isOpen, onClick }) => (
    <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
        <button
            onClick={onClick}
            className="w-full flex justify-between items-center text-left p-4 focus:outline-none hover:bg-gray-50"
        >
            <div className="flex items-center">
                <FaLightbulb className="text-yellow-400 text-xl mr-3 flex-shrink-0" />
                <h3 className="text-base font-semibold text-gray-800">{fact.judul}</h3>
            </div>
            <span className="text-indigo-500 ml-2">
                <FaChevronDown
                    className={`transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                />
            </span>
        </button>
        <div
            className={`overflow-hidden transition-max-height duration-500 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'
                }`}
        >
            <div className="px-4 pb-4 pt-0 text-gray-600">
                <p>{fact.deskripsi}</p>
            </div>
        </div>
    </div>
);

// Komponen untuk Berita (NewsItem) - tidak diubah
const NewsItem = ({ article }) => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition">
        <div className="flex flex-col md:flex-row">
            {article.urlToImage && (
                <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full md:w-48 h-32 object-cover rounded-lg mb-4 md:mb-0 md:mr-4"
                />
            )}
            <div>
                <h3 className="text-lg font-semibold text-gray-800">{article.title}</h3>
                <p className="text-gray-600 text-sm mt-2">
                    {article.description || 'Tidak ada deskripsi yang tersedia.'}
                </p>
                <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 text-sm mt-2 inline-block hover:underline"
                >
                    Baca selengkapnya
                </a>
            </div>
        </div>
    </div>
);

// Komponen Halaman Utama (PasienHome) - DIMODIFIKASI
export default function PasienHome() {
    // State yang sudah ada
    const [facts, setFacts] = useState([]);
    const [loadingFacts, setLoadingFacts] = useState(true);
    const [openIndex, setOpenIndex] = useState(null);
    const [news, setNews] = useState([]);
    const [loadingNews, setLoadingNews] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    // STATE BARU untuk riwayat terakhir
    const [latestCheckup, setLatestCheckup] = useState(null);
    const [loadingCheckup, setLoadingCheckup] = useState(true);

    // useEffect BARU untuk mengambil riwayat terakhir
    useEffect(() => {
        const fetchLatestCheckup = async () => {
            try {
                const response = await apiClient.get('/monitoring/me');
                if (response.data && response.data.length > 0) {
                    // API mengembalikan data dari terbaru, jadi ambil yang pertama (indeks 0)
                    setLatestCheckup(response.data[0]);
                }
            } catch (error) {
                console.error('Gagal memuat riwayat terakhir:', error);
            } finally {
                setLoadingCheckup(false);
            }
        };

        fetchLatestCheckup();
    }, []);


    // useEffect yang sudah ada (tidak diubah)
    useEffect(() => {
        const fetchFunFacts = async () => {
            try {
                const response = await apiClient.get('/faq');
                setFacts(response.data);
            } catch (error) {
                console.error('Gagal memuat Fun Facts:', error);
            } finally {
                setLoadingFacts(false);
            }
        };
        fetchFunFacts();
    }, []);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await fetch(
                    `https://newsapi.org/v2/everything?q=diabetes&language=id&sortBy=publishedAt&apiKey=9f918ad6d2fb4d409ea49c2595261d92`
                );
                const data = await response.json();
                console.log("NewsAPI response:", data); // Debug di console
                if (data.articles) {
                    setNews(data.articles.slice(0, 5));
                }
            } catch (error) {
                console.error('Gagal memuat berita:', error);
            } finally {
                setLoadingNews(false);
            }
        };
        fetchNews();
    }, []);


    const handleToggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <Header />
            <main className="p-4 pb-28">
                <h1 className="text-2xl font-bold mb-1 text-gray-800">Beranda</h1>
                <p className="text-gray-600 mb-8">Selamat datang, {user?.name || 'Pasien'}!</p>

                {/* ========================================================== */}
                {/* BAGIAN BARU: Menampilkan Riwayat Pemeriksaan Terakhir */}
                {/* ========================================================== */}
                {loadingCheckup ? (
                    <p className="text-center text-gray-500 mb-8">Memuat pemeriksaan terakhir...</p>
                ) : latestCheckup ? (
                    <LatestCheckup checkup={latestCheckup} />
                ) : (
                    <p className="text-center text-gray-500 bg-white p-4 rounded-lg shadow-sm mb-8">
                        Belum ada riwayat pemeriksaan.
                    </p>
                )}


                {/* Section Fun Facts */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Fun Facts Seputar Diabetes</h2>
                    {loadingFacts ? (
                        <p className="text-center text-gray-500">Memuat fakta menarik...</p>
                    ) : (
                        <div>
                            {facts.length > 0 ? (
                                facts.map((fact, index) => (
                                    <FunFactItem
                                        key={fact.id}
                                        fact={fact}
                                        isOpen={openIndex === index}
                                        onClick={() => handleToggle(index)}
                                    />
                                ))
                            ) : (
                                <p className="p-4 text-center text-gray-500">
                                    Tidak ada data Fun Facts untuk ditampilkan.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Section Berita */}
                <div className="mt-12">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <FaNewspaper className="text-indigo-500 mr-2" /> Berita Terkini Tentang Diabetes
                    </h2>
                    {loadingNews ? (
                        <p className="text-center text-gray-500">Memuat berita terkini...</p>
                    ) : (
                        <div>
                            {news.length > 0 ? (
                                news.map((article, index) => (
                                    <NewsItem key={index} article={article} />
                                ))
                            ) : (
                                <p className="p-4 text-center text-gray-500">
                                    Tidak ada berita yang tersedia saat ini.
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