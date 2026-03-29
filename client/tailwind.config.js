/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0A0A0F',
          secondary: '#111118',
          tertiary: '#1A1A24',
          elevated: '#1F1F2E',
        },
        accent: {
          blue: '#4F7EFF',
          'blue-light': '#7DA0FF',
          purple: '#9B6EFF',
          green: '#22C55E',
          red: '#EF4444',
          amber: '#F59E0B',
        },
        txt: {
          primary: '#F0F0FF',
          secondary: '#8B8BA8',
          tertiary: '#4A4A68',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
      },
      borderColor: {
        subtle: 'rgba(255,255,255,0.06)',
        medium: 'rgba(255,255,255,0.12)',
        'accent-blue': 'rgba(79,126,255,0.3)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        pulse_red: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
        'pulse-red': 'pulse_red 2s infinite',
      },
    },
  },
  plugins: [],
};
