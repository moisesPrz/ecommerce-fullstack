/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", 'serif'],
        sans: ["'DM Sans'", 'sans-serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#0B1D3A',
          mid: '#152848',
          light: '#1E3A5F',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8C97A',
        }
      },
      boxShadow: {
        card: '0 4px 24px rgba(11,29,58,0.08)',
        hover: '0 12px 40px rgba(11,29,58,0.16)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      }
    },
  },
  plugins: [],
}
