/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#edfff6',
          100: '#d5ffed',
          200: '#aefedb',
          300: '#70fbbf',
          400: '#2cf09a',
          500: '#00d97e',
          600: '#00b264',
          700: '#008c50',
          800: '#006e41',
          900: '#005a37',
        }
      }
    }
  },
  plugins: []
}
