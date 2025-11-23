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
                sans: ['Open Sans', 'sans-serif'],
                serif: ['Lato', 'sans-serif'],
            },
            colors: {
                primary: {
                    DEFAULT: '#008080',
                    hover: '#006666',
                    light: '#E0F2F2',
                },
                secondary: {
                    DEFAULT: '#FF6B6B',
                    hover: '#E65A5A',
                },
            }
        },
    },
    plugins: [],
}
