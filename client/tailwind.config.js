/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Amway 브랜드 참고 컬러 (네이비 블루 + 레드 포인트)
        primary: {
          50: "#eef4fb",
          100: "#d6e4f2",
          200: "#adc8e6",
          300: "#7ba7d6",
          400: "#4a80c2",
          500: "#2a5f9e",
          600: "#1c477e",
          700: "#153563",
          800: "#0f2749",
          900: "#002f5f",
          950: "#001a36",
        },
        accent: {
          50: "#fdecee",
          100: "#fbd0d6",
          200: "#f5a3ad",
          300: "#ee7382",
          400: "#e84a5d",
          500: "#ed174c",
          600: "#c91240",
          700: "#a10f36",
          800: "#7d0c2c",
          900: "#5c0921",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Noto Sans KR",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 2px 10px 0 rgba(0, 47, 95, 0.08)",
        "card-hover": "0 8px 24px 0 rgba(0, 47, 95, 0.14)",
      },
    },
  },
  plugins: [],
};
