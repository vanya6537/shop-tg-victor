module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          blue: '#00D9FF',
          cyan: '#00FFFF',
          purple: '#B300FF',
          pink: '#FF00FF',
          green: '#39FF14',
          dark: '#0A0E27',
          darker: '#050812',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 20px rgba(0, 217, 255, 0.5)',
        'neon-purple': '0 0 20px rgba(179, 0, 255, 0.5)',
        'neon-green': '0 0 20px rgba(57, 255, 20, 0.5)',
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { textShadow: '0 0 10px rgba(0, 217, 255, 0.5)' },
          '50%': { textShadow: '0 0 20px rgba(0, 217, 255, 1)' },
        }
      }
    },
  },
  plugins: [],
}
