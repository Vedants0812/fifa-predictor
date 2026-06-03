/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0A0F1C',
        surface: '#111827',
        surface2: '#1A2235',
        surface3: '#1E2B42',
        border: '#1E2B42',
        border2: '#263347',
        primary: '#3B82F6',
        accent: '#22C55E',
        amber: '#F59E0B',
        danger: '#EF4444',
        muted: '#64748B',
        subtle: '#94A3B8',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        head: ['var(--font-syne)', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease forwards',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'bar-fill': 'barFill 1s cubic-bezier(.25,.46,.45,.94) forwards',
      },
      keyframes: {
        fadeUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseDot: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
        barFill: { from: { width: '0%' }, to: {} },
      },
    },
  },
  plugins: [],
};
