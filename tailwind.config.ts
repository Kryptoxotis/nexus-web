import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        nexus: {
          orange: '#FF6B35',
          'orange-hover': '#E55A2B',
          green: '#2D6A4F',
          'green-light': '#40916C',
          'green-dark': '#1B4332',
          'green-hover': '#245A42',
          bg: '#111111',
          surface: '#1A1A1A',
          'surface-light': '#252525',
          border: '#333333',
        },
      },
    },
  },
  plugins: [],
}
export default config
