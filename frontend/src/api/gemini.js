import axios from "axios";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function getGeminiRecommendation(result) {
  try {
    const riskText = result.risk_factors
      .map(
        (f, i) =>
          `${i + 1}. ${f.feature}: ${f.value} (${f.status})`
      )
      .join("\n");

    const prompt = `
Kamu adalah asisten medis AI untuk aplikasi kesehatan bernama Glucosense.

Berikut hasil analisis pengguna:
- Hasil prediksi: ${result.result}
- Probabilitas risiko: ${result.probability}%
- Faktor risiko utama:
${riskText}

Tulis rekomendasi personal dan mudah dimengerti dalam format berikut (tanpa markdown atau tanda khusus):

Ringkasan AI:
(satu paragraf singkat tentang kondisi pengguna)

Faktor Risiko dan Dampaknya:
- (faktor): (nilai dan dampak singkat)
- ...

Rekomendasi Utama:
1. ...
2. ...
3. ...

Catatan:
(Tulis catatan seperti: "Hasil ini bersifat prediksi dan tidak menggantikan diagnosis dokter.")
`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      { headers: { "Content-Type": "application/json" } }
    );

    return (
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Tidak ada rekomendasi yang dapat dihasilkan saat ini."
    );
  } catch (err) {
    console.error("❌ Error from Gemini:", err);
    return "AI gagal memberikan rekomendasi. Silakan coba lagi nanti.";
  }
}