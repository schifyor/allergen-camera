module.exports = {
  content: [
    './index.html',
    './src/*.{js,ts,jsx,tsx}',  // Direkt im src-Ordner
    './src/**/*.{js,ts,jsx,tsx}', // Alle Unterordner von src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
