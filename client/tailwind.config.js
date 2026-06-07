/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      xs: '375px',
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C8A97E',
          light: '#D9BFA0',
          dark: '#A8864A',
        },
        secondary: {
          DEFAULT: '#D8A7B1',
          light: '#E8C4CB',
          dark: '#B87D8A',
        },
        brand: {
          bg: '#FFF9F5',
          surface: '#F5EFE8',
          text: '#1C1C1C',
          muted: '#6B6B6B',
          border: '#E8DDD4',
        },
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #C8A97E 0%, #D9BFA0 50%, #A8864A 100%)',
        'gradient-rose': 'linear-gradient(135deg, #D8A7B1 0%, #E8C4CB 100%)',
        'gradient-luxury': 'linear-gradient(180deg, #FFF9F5 0%, #F5EFE8 100%)',
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        'marquee-reverse': 'marqueeReverse 30s linear infinite',
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        shimmer: 'shimmer 2s infinite linear',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        marqueeReverse: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      boxShadow: {
        luxury: '0 8px 32px rgba(200, 169, 126, 0.15)',
        'luxury-lg': '0 16px 48px rgba(200, 169, 126, 0.2)',
        card: '0 2px 16px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        none: '0',
      },
    },
  },
  plugins: [],
};
