// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // === Palet Utama ===
        primaryBlue: "#1E3A5F",
        softBlue: "#3E5F8A",
        primaryRed: "#FF4C4C",

        // === Netral & Background ===
        neutralBg: "#F5F7FA",
        cardWhite: "#FFFFFF",
        lineGray: "#E5E7EB",
        textPrimary: "#1A1A1A",
        textSecondary: "#6B7280",

        // === Palet Tambahan ===
        successGreen: "#10B981",
        warningAmber: "#F59E0B",
        errorRed: "#DC2626",
        infoBlue: "#2563EB",
        mutedGray: "#9CA3AF",
      },
    },
  },
  plugins: [],
};