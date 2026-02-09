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
          teal: '#00A896',
          'teal-hover': '#008F80',
          bg: '#0A0E27',
          surface: '#1A1F3A',
          'surface-light': '#242A4A',
          border: '#2E3557',
        },
      },
    },
  },
  plugins: [],
}
export default config
