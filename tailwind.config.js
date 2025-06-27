/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Убедитесь, что путь включает ваши файлы
  ],
  theme: {
    extend: {
      colors: {
        'gold': '#D4A017',
        'table-gray': '#808080',
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'open-sans': ['Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};