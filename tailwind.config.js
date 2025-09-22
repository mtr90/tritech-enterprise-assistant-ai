/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#1a202c',
        foreground: '#f7fafc',
        primary: {
          DEFAULT: '#3182ce',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#2d3748',
          foreground: '#f7fafc',
        },
        muted: {
          DEFAULT: '#4a5568',
          foreground: '#a0aec0',
        },
        border: '#4a5568',
        input: '#2d3748',
        ring: '#3182ce',
      },
    },
  },
  plugins: [],
}
