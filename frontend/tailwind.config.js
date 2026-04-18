/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        stellar: {
          50:  '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7dc8fc',
          400: '#38aaf8',
          500: '#0e90e9',
          600: '#0272c7',
          700: '#0359a1',
          800: '#074c85',
          900: '#0c3f6e',
          950: '#082849',
        },
        cosmos: {
          900: '#080c14',
          800: '#0d1524',
          700: '#121e36',
          600: '#1a2a4a',
          500: '#24395e',
        },
        pulse: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        aurora: {
          purple: '#8b5cf6',
          pink:   '#ec4899',
          blue:   '#3b82f6',
          cyan:   '#06b6d4',
        }
      },
      animation: {
        'pulse-slow':    'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':         'float 6s ease-in-out infinite',
        'glow':          'glow 2s ease-in-out infinite alternate',
        'bar-fill':      'barFill 0.8s ease-out forwards',
        'slide-up':      'slideUp 0.4s ease-out forwards',
        'fade-in':       'fadeIn 0.3s ease-out forwards',
        'spin-slow':     'spin 8s linear infinite',
        'shimmer':       'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        glow: {
          from: { textShadow: '0 0 10px #06b6d4, 0 0 20px #06b6d4' },
          to:   { textShadow: '0 0 20px #06b6d4, 0 0 40px #06b6d4, 0 0 60px #0891b2' },
        },
        barFill: {
          from: { width: '0%' },
          to:   { width: 'var(--bar-width)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'grid-pattern':    'linear-gradient(rgba(6, 182, 212, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.05) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      boxShadow: {
        'stellar': '0 0 30px rgba(6, 182, 212, 0.3)',
        'stellar-lg': '0 0 60px rgba(6, 182, 212, 0.4)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.5)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(6, 182, 212, 0.1)',
      },
    },
  },
  plugins: [],
};
