import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{vue,ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#050505',
        surface: '#08140F',
        emerald: '#043D2C',
        'emerald-glow': '#056E41',
        champagne: '#E8D6B3',
        platinum: '#C0C0C0',
        smoke: '#9AA3A1',
        cinder: '#5E645F',
        'accent-gold': '#D4AF37',
        'accent-silver': '#E0E0E0',
        'velvet-shadow': '#03110C',
      },
      fontFamily: {
        sans: ['Source Sans 3', 'Montserrat', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Playfair Display', 'serif'],
        display: ['Playfair Display', 'Cinzel', 'serif'],
      },
      letterSpacing: {
        extra: '0.35em',
      },
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'silk-flow': 'cubic-bezier(0.6, 0, 0.4, 1)',
      },
      backgroundImage: {
        'velvet-radial':
          'radial-gradient(circle at 30% 50%, rgba(5, 20, 15, 0.55), rgba(5, 5, 5, 0.95))',
      },
    },
  },
  plugins: [],
}

export default config
