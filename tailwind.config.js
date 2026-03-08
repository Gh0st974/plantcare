/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
  'bg-plant-50', 'bg-plant-100', 'bg-plant-200', 'bg-plant-300',
  'bg-plant-400', 'bg-plant-600', 'bg-plant-700', 'bg-plant-800', 'bg-plant-900',
  'text-plant-50', 'text-plant-100', 'text-plant-200', 'text-plant-300',
  'text-plant-400', 'text-plant-600', 'text-plant-700', 'text-plant-800', 'text-plant-900',
  'border-plant-50', 'border-plant-100', 'border-plant-200', 'border-plant-300',
  'border-plant-400', 'border-plant-600', 'border-plant-700', 'border-plant-800', 'border-plant-900',
],

  theme: {
    extend: {
      colors: {
        plant: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        }
      }
    },
  },
  plugins: [],
}
