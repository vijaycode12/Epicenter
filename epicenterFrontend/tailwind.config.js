/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0b0d12',
        navy: '#10131c',
        brand: {
          red: '#e42430',
          'red-dark': '#c11c26',
        },
        bg: '#f3f4f6',
        muted: '#6b7280',
        border: '#e6e7eb',
      },
      fontFamily: {
        display: ['Sora', 'Manrope', 'system-ui', 'sans-serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
