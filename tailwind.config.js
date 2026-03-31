/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        su: {
          blue: '#003366',
          gold: '#FFCC00',
          'gold-light': '#FFD700',
          crimson: '#990000',
        },
        cwc: {
          normal: '#10B981',
          warning: '#F59E0B',
          danger: '#F97316',
          extreme: '#EF4444',
        },
        brand: {
          primary: '#06b6d4',
          secondary: '#3b82f6',
          accent: '#8b5cf6',
        },
        surface: {
          primary: '#0f172a',
          secondary: '#1e293b',
          tertiary: '#334155',
        },
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glass-lg': '0 8px 32px rgba(0, 0, 0, 0.2)',
        'float': '0 10px 40px rgba(0, 0, 0, 0.15)',
        'float-lg': '0 20px 60px rgba(0, 0, 0, 0.3)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.3)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
