import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C0392B',
          dark: '#922B21'
        },
        secondary: '#1A1A2E',
        accent: '#E67E22',
        background: '#FAFAF8',
        surface: '#FFFFFF',
        border: '#E8E4DF',
        'text-primary': '#1A1A2E',
        'text-secondary': '#6B7280',
        'text-muted': '#9CA3AF',
        success: '#27AE60',
        warning: '#F39C12',
        error: '#E74C3C',
        locked: '#6B7280',
        gold: '#F1C40F'
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.08)',
        md: '0 4px 12px rgba(0,0,0,0.10)',
        lg: '0 8px 24px rgba(0,0,0,0.12)',
        xl: '0 16px 48px rgba(0,0,0,0.15)'
      },
      borderRadius: {
        btn: '8px',
        card: '12px'
      },
      maxWidth: {
        reading: '720px',
        container: '1280px'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' }
        }
      },
      animation: {
        shimmer: 'shimmer 1.5s linear infinite'
      }
    }
  },
  plugins: []
};

export default config;
