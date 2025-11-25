import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{vue,ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        atelier: '#F9F9F9',
        silk: '#FFFFFF',
        charcoal: '#1A1A1A',
        stone: '#595959',
        fog: '#8C8C8C',
        'platinum-hairline': '#E5E5E5',
        champagne: '#D4AF37',
        vapor: 'rgba(255, 255, 255, 0.65)',
        shimmer: '#FFF8E7',
        'soft-shadow': 'rgba(200, 200, 200, 0.2)',
      },
      fontFamily: {
        sans: ['Inter', 'Source Sans 3', 'sans-serif'],
        serif: ['Playfair Display', 'Cormorant Garamond', 'serif'],
        display: ['Playfair Display', 'Cinzel', 'serif'],
      },
      letterSpacing: {
        wide: '0.35em',
        ultrawide: '0.5em',
      },
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'silk-flow': 'cubic-bezier(0.6, 0, 0.4, 1)',
      },
      boxShadow: {
        levitation: '0 25px 60px rgba(210, 210, 210, 0.45)',
        filament: 'inset 0 0 30px rgba(255, 255, 255, 0.35)',
      },
    },
  },
  plugins: [],
}

export default config
