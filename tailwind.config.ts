import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{vue,ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#FFFFFF',
        structure: '#000000',
        brand: '#000226', // Midnight Abyss
        slate: '#E2E8F0', // Cool Slate
        // Legacy colors (kept for compatibility if needed, but prefer new ones)
        atelier: '#F9F9F9',
        silk: '#FFFFFF',
        charcoal: '#1A1A1A',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Bodoni Moda', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Bodoni Moda', 'serif'],
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
