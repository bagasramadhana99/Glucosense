import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosConfig';
import {
  FaChevronDown,
  FaLightbulb,
  FaNewspaper,
  FaHeartbeat,
  FaCalendarAlt,
} from 'react-icons/fa';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';

// =========================
// Skeleton Loader
// =========================
const ImageSkeleton = () => (
  <div className="bg-gray-200 border rounded-xl w-full h-32 animate-pulse" />
);

const TextSkeleton = () => (
  <div className="space-y-2">
    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
  </div>
);

// =========================
// Latest Checkup
// =========================
const LatestCheckup = ({ checkup }) => {
  const navigate = useNavigate();

  const date = new Date(checkup.timestamp);
  const formattedDateTime = date.toLocaleDateString('id-ID', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleViewAll = () => {
    navigate('/pasien/riwayat');
  };

  return (
    <div className="bg-cardWhite p-6 rounded-2xl shadow-md border border-lineGray transition hover:shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-textPrimary flex items-center">
          <FaHeartbeat className="text-primaryRed mr-2.5" />
          Pemeriksaan Terakhir
        </h2>
        <button
          onClick={handleViewAll}
          className="text-sm font-medium text-softBlue hover:underline transition"
        >
          Lihat Semua
        </button>
      </div>

      <div className="flex items-center text-textSecondary text-sm mb-5">
        <FaCalendarAlt className="mr-1.5 text-xs" />
        <span>{formattedDateTime} WIB</span>
      </div>

      <div className="grid grid-cols-2 gap-6 text-center">
        <div>
          <p className="text-textSecondary text-sm">Glukosa Darah</p>
          <p className="text-2xl font-bold text-textPrimary mt-1">
            {checkup.glucose_level}{' '}
            <span className="text-sm font-normal text-textSecondary">mg/dL</span>
          </p>
        </div>
        <div>
          <p className="text-textSecondary text-sm">Detak Jantung</p>
          <p className="text-2xl font-bold text-textPrimary mt-1">
            {checkup.heart_rate}{' '}
            <span className="text-sm font-normal text-textSecondary">bpm</span>
          </p>
        </div>
      </div>
    </div>
  );
};

// =========================
// Fun Fact Accordion
// =========================
const FunFactItem = ({ fact, isOpen, onClick }) => {
  const handleClick = () => {
    onClick();
  };

  return (
    <div className="bg-cardWhite rounded-xl shadow-md border border-lineGray overflow-hidden mb-3 transition-all duration-300 hover:shadow-lg">
      <button
        onClick={handleClick}
        className="w-full flex justify-between items-center text-left p-5 focus:outline-none hover:bg-neutralBg/20 transition"
        aria-expanded={isOpen}
      >
        <div className="flex items-center flex-1">
          <FaLightbulb className="text-yellow-500 text-xl mr-3 flex-shrink-0" />
          <h3 className="font-semibold text-textPrimary pr-4">{fact.judul}</h3>
        </div>
        <FaChevronDown
          className={`text-softBlue transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 pb-5 pt-1">
          <p className="text-textSecondary leading-relaxed">{fact.deskripsi}</p>
        </div>
      </div>
    </div>
  );
};

// =========================
// News Item
// =========================
const NewsItem = ({ article }) => {
  const handleReadMore = (e) => {
    e.preventDefault();
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-cardWhite rounded-xl shadow-md border border-lineGray p-4 hover:shadow-lg transition-all duration-300">
      <div className="flex gap-3">
        {article.urlToImage ? (
          <img
            src={article.urlToImage}
            alt={article.title}
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
            loading="lazy"
          />
        ) : (
          <div className="w-20 h-20 bg-neutralBg/50 rounded-lg flex items-center justify-center flex-shrink-0">
            <FaNewspaper className="text-2xl text-textSecondary/30" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-textPrimary line-clamp-2">
            {article.title}
          </h3>
          <p className="text-textSecondary text-xs mt-1 line-clamp-2">
            {article.description || 'Tidak ada deskripsi.'}
          </p>
          <button
            onClick={handleReadMore}
            className="text-softBlue text-xs font-medium mt-2 inline-block hover:underline"
          >
            Baca →
          </button>
        </div>
      </div>
    </div>
  );
};

// =========================
// Main Component
// =========================
export default function PasienHome() {
  const [facts, setFacts] = useState([]);
  const [loadingFacts, setLoadingFacts] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [latestCheckup, setLatestCheckup] = useState(null);
  const [loadingCheckup, setLoadingCheckup] = useState(true);

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  // Ambil data pemeriksaan terakhir
  useEffect(() => {
    const fetchLatestCheckup = async () => {
      try {
        const { data } = await apiClient.get('/monitoring/me');
        setLatestCheckup(data?.[0] || null);
      } catch (err) {
        console.error('Gagal memuat pemeriksaan:', err);
      } finally {
        setLoadingCheckup(false);
      }
    };
    fetchLatestCheckup();
  }, []);

  // Ambil data fun facts
  useEffect(() => {
    const fetchFunFacts = async () => {
      try {
        const { data } = await apiClient.get('/faq');
        setFacts(data);
      } catch (err) {
        console.error('Gagal memuat Fun Facts:', err);
      } finally {
        setLoadingFacts(false);
      }
    };
    fetchFunFacts();
  }, []);

  // Ambil berita terbaru dari API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(
          `https://newsapi.org/v2/everything?q=diabetes&language=id&sortBy=publishedAt&apiKey=9f918ad6d2fb4d409ea49c2595261d92`
        );
        const { articles } = await res.json();
        setNews(articles?.slice(0, 6) || []);
      } catch (err) {
        console.error('Gagal memuat berita:', err);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNews();
  }, []);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleStartCheckup = () => {
    navigate('/pasien/pemeriksaan');
  };

  return (
    <div className="bg-neutralBg min-h-screen">
      <Header />

      <main className="pt-6 pb-32 px-4 md:px-8">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-textPrimary">Beranda</h1>
          <p className="text-textSecondary mt-1 text-sm md:text-base">
            Selamat datang,{' '}
            <span className="font-semibold text-primaryBlue">
              {user?.name || 'Pasien'}
            </span>
            !
          </p>
        </div>

        {/* Layout */}
        <div className="block md:grid md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-8">
            {/* Latest Checkup */}
            <section aria-labelledby="latest-checkup">
              {loadingCheckup ? (
                <div className="bg-cardWhite p-6 rounded-2xl shadow-md border border-lineGray">
                  <TextSkeleton />
                </div>
              ) : latestCheckup ? (
                <LatestCheckup checkup={latestCheckup} />
              ) : (
                <div className="bg-cardWhite p-8 rounded-2xl shadow-md border border-lineGray text-center">
                  <p className="text-textSecondary">Belum ada riwayat pemeriksaan.</p>
                  <button
                    onClick={handleStartCheckup}
                    className="mt-3 text-softBlue font-medium hover:underline"
                  >
                    Mulai Pemeriksaan
                  </button>
                </div>
              )}
            </section>

            {/* Fun Facts */}
            <section aria-labelledby="fun-facts">
              <h2
                id="fun-facts"
                className="text-xl font-bold text-textPrimary mb-4 flex items-center"
              >
                <FaLightbulb className="text-yellow-500 mr-2.5" />
                Fun Facts Seputar Diabetes
              </h2>

              {loadingFacts ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-cardWhite p-5 rounded-xl shadow-md border border-lineGray"
                    >
                      <TextSkeleton />
                    </div>
                  ))}
                </div>
              ) : facts.length > 0 ? (
                <div className="space-y-3">
                  {facts.map((fact, idx) => (
                    <FunFactItem
                      key={fact.id}
                      fact={fact}
                      isOpen={openIndex === idx}
                      onClick={() => toggleAccordion(idx)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-textSecondary py-4">
                  Tidak ada Fun Facts tersedia.
                </p>
              )}
            </section>
          </div>

          {/* Right Column */}
          <div className="md:col-span-1">
            <section aria-labelledby="latest-news">
              <h2
                id="latest-news"
                className="text-xl font-bold text-textPrimary mb-4 flex items-center"
              >
                <FaNewspaper className="text-primaryBlue mr-2.5" />
                Berita Terkini
              </h2>

              <div className="space-y-3 pr-2 max-h-[500px] md:max-h-[600px] overflow-y-auto">
                {loadingNews ? (
                  [...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-cardWhite p-4 rounded-xl shadow-md border border-lineGray flex gap-3"
                    >
                      <div className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse" />
                      <div className="flex-1">
                        <TextSkeleton />
                      </div>
                    </div>
                  ))
                ) : news.length > 0 ? (
                  news.map((article, idx) => (
                    <NewsItem key={`${article.url}-${idx}`} article={article} />
                  ))
                ) : (
                  <p className="text-center text-textSecondary py-4 text-sm">
                    Tidak ada berita saat ini.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}