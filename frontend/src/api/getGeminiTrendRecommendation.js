import axios from "axios";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function getGeminiTrendRecommendation(trendResult) {
  try {
    const avg = trendResult.average_prediction;
    const predictions = trendResult.predictions;

    const trendDirection =
      predictions[predictions.length - 1] > predictions[0]
        ? "meningkat"
        : predictions[predictions.length - 1] < predictions[0]
        ? "menurun"
        : "stabil";

    const prompt = `
Kamu adalah asisten medis AI untuk aplikasi kesehatan bernama Glucosense.

Berikut hasil prediksi tren kadar glukosa pengguna:
- Rata-rata prediksi 5 hari ke depan: ${avg} mg/dL
- Pola tren: ${trendDirection}
- Nilai prediksi harian: ${predictions.join(", ")} mg/dL

Tulis analisis dan rekomendasi gaya hidup yang mudah dipahami, dalam bahasa Indonesia yang sopan, singkat, dan jelas.
Gunakan format berikut (tanpa markdown atau tanda khusus):

Ringkasan AI:
(1 paragraf yang menjelaskan kondisi tren pengguna dan interpretasinya)

Analisis Tren:
- Rata-rata kadar glukosa: ...
- Pola pergerakan: ...
- Risiko potensial: ...

Rekomendasi Utama:
1. ...
2. ...
3. ...

Catatan:
(Tulis peringatan ringan bahwa hasil ini tidak menggantikan diagnosis dokter)
`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { "Content-Type": "application/json" } }
    );

    return (
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Tidak ada rekomendasi yang dapat dihasilkan saat ini."
    );
  } catch (err) {
    console.error("❌ Error from Gemini (Trend):", err);
    return "AI gagal memberikan rekomendasi tren. Silakan coba lagi nanti.";
  }
}
