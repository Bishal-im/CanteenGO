/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ff6b00", // Vibrant Orange (Restaurant theme)
        accent: "#ea580c", // Deep Orange (Better than amber)
        background: "#080808", // Warmer deep dark background
        card: "#181412", // Deeper, warmer restaurant card
        muted: "#1c1917", // Warmer obsidian
      },
      borderRadius: {
        '4xl': '32px',
        '5xl': '40px',
      }
    },
  },
  plugins: [],
};
