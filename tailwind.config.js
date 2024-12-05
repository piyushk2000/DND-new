/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "mainBackgroundColor": "#ffffff",
        "accentColor": "#ffbe34",
        "columnBackgroundColor": "#f3f4f6",
        "textPrimary": "#1f2937",
        "textSecondary": "#4b5563"
      }
    },
  },
  plugins: [],
}

