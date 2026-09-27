/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#FFFFFF',
          raised: '#F9FAFB',
          card: '#FFFFFF',
          border: '#E5E7EB',
        },
        accent: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
          muted: 'rgba(59,130,246,0.15)',
          ring: 'rgba(59,130,246,0.35)',
        },
        text: {
          primary: '#111827',
          secondary: '#374151',
          muted: '#4B5563',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          amber: '#D97706',
          error: '#EF4444',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
