/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fcf8f3',
          100: '#f6ede0',
          200: '#ecd7be',
          300: '#deba92',
          400: '#d19864',
          500: '#c87a3e',
          600: '#b85d26',
          700: '#96441b',
          800: '#7a371c',
          900: '#461f10',
        },
        forest: {
          50: '#f3f7f5',
          100: '#e1ede7',
          200: '#c4dbcf',
          300: '#9bc0af',
          400: '#6ea08b',
          500: '#4d846f',
          600: '#3a6857',
          700: '#2f5346',
          800: '#233d34',
          850: '#182923',
          900: '#111d19',
          950: '#09100d',
        },
        sand: {
          50: '#faf8f4',
          100: '#f3eee4',
          200: '#e5dcce',
          300: '#d2c3ae',
          400: '#bba48b',
          500: '#a3876d',
          600: '#8b6e55',
          700: '#6f5642',
          800: '#534032',
          900: '#362a22',
        },
        amber: {
          400: '#f59e0b',
          500: '#d97706',
        }
      },
      boxShadow: {
        glow: '0 4px 20px -2px rgba(184, 93, 38, 0.35)',
        lodge: '0 20px 40px -15px rgba(9, 16, 13, 0.7), 0 0 0 1px rgba(229, 220, 206, 0.08)',
        card: '0 12px 30px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      }
    }
  },
  plugins: [],
};
