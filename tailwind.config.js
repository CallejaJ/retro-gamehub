/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "press-start": ["Press Start 2P", "Courier New", "monospace"],
        retro: [
          "Retro Gaming",
          "RetroGaming",
          "Press Start 2P",
          "Courier New",
          "monospace",
        ],
        "retro-gaming": [
          "RetroGaming",
          "Retro Gaming",
          "Press Start 2P",
          "Courier New",
          "monospace",
        ],
      },
      animation: {
        "rainbow-wave": "rainbow-wave 4s ease-in-out infinite",
        "gradient-pulse": "gradient-pulse 3s ease-in-out infinite",
        "matrix-rain": "matrix-rain 10s linear infinite",
        "scan-lines": "scan-lines 2s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        "rainbow-wave": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "gradient-pulse": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "matrix-rain": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(100vh)", opacity: "0" },
        },
        "scan-lines": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 100vh" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(180deg)" },
        },
      },
    },
  },
  plugins: [],
};
