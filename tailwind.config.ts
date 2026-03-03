import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-system)'],
        body: ['var(--font-system)'],
      },
      colors: {
        ink: '#1A1A1A',
        paper: '#F7F6F3',
        muted: '#9B9B9B',
        line: '#E8E8E6',
        soft: '#F0F0EE',
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
} satisfies Config
