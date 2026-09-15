/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#05070a',
          900: '#0a0e13',
          850: '#0d1218',
          800: '#11161d',
          700: '#171d26',
          600: '#232a35',
        },
        ink: {
          100: '#eef2f6',
          300: '#c2cbd6',
          500: '#8b96a5',
          700: '#5a6472',
        },
        accent: {
          DEFAULT: '#34e0a1',
          soft: '#8ff2c9',
          dim: '#1f9d70',
        },
        violet: {
          DEFAULT: '#7c6bff',
          soft: '#a79bff',
        },
        status: {
          todo: '#5a6472',
          progress: '#4f8ff7',
          review: '#f5b942',
          done: '#34e0a1',
        },
        priority: {
          low: '#5a6472',
          medium: '#4f8ff7',
          high: '#f5924a',
          critical: '#f0576a',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(52,224,161,0.15), 0 8px 30px -8px rgba(52,224,161,0.25)',
        'glow-violet': '0 0 0 1px rgba(124,107,255,0.18), 0 8px 30px -8px rgba(124,107,255,0.3)',
        panel: '0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 60px -20px rgba(0,0,0,0.6)',
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(2%, -3%, 0) scale(1.05)' },
        },
        driftSlow: {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(-3%, 2%, 0) scale(1.08)' },
        },
        gridPan: {
          '0%': { backgroundPosition: '0px 0px' },
          '100%': { backgroundPosition: '64px 64px' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(52,224,161,0.55)' },
          '70%': { boxShadow: '0 0 0 8px rgba(52,224,161,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(52,224,161,0)' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        orbitSpin: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
      },
      animation: {
        drift: 'drift 18s ease-in-out infinite',
        driftSlow: 'driftSlow 24s ease-in-out infinite',
        gridPan: 'gridPan 6s linear infinite',
        pulseRing: 'pulseRing 2s cubic-bezier(0.4,0,0.6,1) infinite',
        floatY: 'floatY 4s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        orbitSpin: 'orbitSpin 28s linear infinite',
      },
    },
  },
  plugins: [],
};
