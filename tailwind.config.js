/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Light Theme
        bg: {
          light: '#f8f9fa',
          dark: '#0d1117',
        },
        card: {
          light: '#ffffff',
          dark: '#161b22',
        },
        primary: {
          light: '#0d6efd',
          dark: '#2f81f7',
        },
      },
    },
  },
  plugins: [],
}
