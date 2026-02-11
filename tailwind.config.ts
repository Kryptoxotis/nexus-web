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
          'orange-hover': '#FF8C5A',
          'orange-dark': '#E55A2B',
          blue: '#3B82F6',
          'blue-light': '#60A5FA',
          'blue-dark': '#2563EB',
          'blue-hover': '#4F8FF7',
          bg: '#0B0F1A',
          surface: '#111827',
          'surface-light': '#1E293B',
          border: '#2A3654',
          'text-primary': '#F1F5F9',
          'text-secondary': '#94A3B8',
        },
      },
      boxShadow: {
        'glow-orange': '0 0 15px rgba(255, 107, 53, 0.4), 0 0 30px rgba(255, 107, 53, 0.1)',
        'glow-blue': '0 0 15px rgba(59, 130, 246, 0.4), 0 0 30px rgba(59, 130, 246, 0.1)',
        'glow-sm-orange': '0 0 8px rgba(255, 107, 53, 0.3)',
        'glow-sm-blue': '0 0 8px rgba(59, 130, 246, 0.3)',
      },
    },
  },
  plugins: [],
}
export default config
