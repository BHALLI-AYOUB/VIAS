/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff9e6',
          100: '#fff2bf',
          200: '#ffe47a',
          300: '#ffd53d',
          400: '#f5c400',
          500: '#dca900',
          600: '#b68400',
          700: '#8a6303',
          800: '#5f4406',
          900: '#382804',
        },
        ink: '#101010',
      },
      boxShadow: {
        panel: '0 18px 40px rgba(15, 23, 42, 0.12)',
      },
      backgroundImage: {
        grid: 'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['"Space Grotesk"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
