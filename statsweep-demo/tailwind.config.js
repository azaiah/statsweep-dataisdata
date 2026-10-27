/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: { DEFAULT: '#0B1F33', 2: '#12304D', 3: '#1B4064' },
        sterile: '#F2F6F7',
        paper: '#FFFFFF',
        ink: '#10202F',
        steel: '#5A6B7B',
        line: '#D5DEE3',
        cryo: { DEFAULT: '#0B7C7E', dark: '#0A6E70', bright: '#39D5CF', wash: '#E3F4F4' },
        stat: { DEFAULT: '#D42A36', dark: '#B5222D', light: '#FF6B6E', wash: '#FCE9EA' },
        ice: '#BFE7F2',
        carbon: { DEFAULT: '#F6E7A8', deep: '#E9D27A' },
        ok: '#1E7A4C', warn: '#A86A12',
      },
      fontFamily: {
        display: ['"Archivo Variable"', 'Archivo', 'Arial', 'sans-serif'],
        sans: ['"Public Sans Variable"', '"Public Sans"', 'system-ui', 'sans-serif'],
      },
      maxWidth: { prose: '68ch' },
    },
  },
  plugins: [],
}
