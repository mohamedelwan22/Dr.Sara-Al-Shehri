/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#FAF7F2',
          light: '#FFFFFF',
          dark: '#F3EEE6',
        },
        primary: {
          50: '#F4F0FB',
          100: '#E9E1F7',
          200: '#D2C3EF',
          300: '#B49AE2',
          400: '#9671D5',
          500: '#7B4FC4',
          600: '#6A3FB0',
          700: '#593496',
          800: '#4A2C7D',
          900: '#3D2566',
          DEFAULT: '#6A3FB0',
        },
        gold: {
          50: '#FBF7EB',
          100: '#F6ECC9',
          200: '#EED995',
          300: '#E4C15F',
          400: '#D9A63A',
          500: '#C8962A',
          600: '#A87A22',
          700: '#865F1E',
          800: '#6D4E1E',
          900: '#5B421E',
          DEFAULT: '#C8962A',
        },
        slateGray: {
          DEFAULT: '#8A8A8E',
          light: '#A3A3A8',
          dark: '#5E5E63',
        },
      },
      fontFamily: {
        sans: [
          'Tajawal',
          'Segoe UI',
          'Tahoma',
          'system-ui',
          'sans-serif',
        ],
        serif: ['Amiri', 'Times New Roman', 'serif'],
        display: ['Amiri', 'serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        elevated: '0 10px 30px -10px rgb(74 44 125 / 0.15)',
        gold: '0 4px 14px -4px rgb(200 150 42 / 0.45)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'marquee-ltr': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(50%)' },
        },
        'marquee-rtl': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'draw-arch': {
          from: { strokeDashoffset: '300' },
          to: { strokeDashoffset: '0' },
        },
        'open-book': {
          '0%': { transform: 'scaleY(0)', opacity: '0' },
          '100%': { transform: 'scaleY(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'fade-up': 'fade-up 0.5s ease-out both',
        'scale-in': 'scale-in 0.25s ease-out both',
        shimmer: 'shimmer 1.5s infinite linear',
        'marquee-ltr': 'marquee-ltr 30s linear infinite',
        'marquee-rtl': 'marquee-rtl 30s linear infinite',
        'draw-arch': 'draw-arch 0.6s ease-out forwards',
        'open-book': 'open-book 0.5s ease-out 0.4s both',
      },
    },
  },
  plugins: [],
};
