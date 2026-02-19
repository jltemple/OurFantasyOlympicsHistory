/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: {
          DEFAULT: '#0a0a0f',
          card:    '#12121a',
          hover:   '#1a1a26',
          border:  'rgba(255,255,255,0.08)',
        },
        accent: {
          blue:   '#3b82f6',
          gold:   '#f59e0b',
          silver: '#94a3b8',
          bronze: '#cd7c3a',
        },
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.4)',
        glow: '0 0 20px rgba(59,130,246,0.15)',
      },
    },
  },
  plugins: [],
}
