import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#7c3aed',
          blue: '#3b82f6',
          pink: '#ec4899',
          dark: '#070710',
          card: 'rgba(255,255,255,0.04)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'blob': 'blob 8s infinite alternate',
        'blob-reverse': 'blob 10s infinite alternate-reverse',
        'fade-up': 'fadeUp 0.5s ease-out',
        'shake': 'shake 0.4s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        blob: {
          '0%':   { transform: 'translate(0px, 0px) scale(1)' },
          '33%':  { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%':  { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%':      { transform: 'translateX(-8px)' },
          '40%':      { transform: 'translateX(8px)' },
          '60%':      { transform: 'translateX(-4px)' },
          '80%':      { transform: 'translateX(4px)' },
        },
      },
      backdropBlur: { xl: '24px' },
      boxShadow: {
        glow:        '0 0 30px rgba(124,58,237,0.3)',
        'glow-blue': '0 0 30px rgba(59,130,246,0.3)',
        card:        '0 25px 50px -12px rgba(0,0,0,0.8)',
      },
    },
  },
  plugins: [],
};

export default config;
