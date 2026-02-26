import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
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
