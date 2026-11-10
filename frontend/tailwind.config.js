/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        purple: {
          DEFAULT: '#68764A',
          light: '#8A9C68',
          dark: '#4F5B35',
        },
        sky: {
          DEFAULT: '#55C7E8',
          light: '#7DD9F5',
          dark: '#2FABD4',
        },
        cream: {
          DEFAULT: '#FFF5D9',
          dark: '#FFE9A8',
        },
        green: {
          game: '#75D66B',
          dark: '#52B848',
        },
        orange: {
          game: '#FFB547',
          dark: '#E8990A',
        },
        pink: {
          game: '#FF6685',
          dark: '#E8325A',
        },
        navy: {
          DEFAULT: '#30304A',
          light: '#44446A',
        },
      },
      fontFamily: {
        display: ['"Nunito"', 'sans-serif'],
        body: ['"Nunito"', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '3rem',
      },
      boxShadow: {
        game: '0 6px 0 rgba(0,0,0,0.15)',
        'game-lg': '0 8px 0 rgba(0,0,0,0.2)',
        card: '4px 4px 0px rgba(0,0,0,0.12)',
        'card-purple': '4px 4px 0px rgba(104, 118, 74, 0.4)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'pop': 'pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

