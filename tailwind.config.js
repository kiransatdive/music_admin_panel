/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#00aeef',
          hover: '#009dcb',
          light: '#e6f7fe',
        },
        secondary: '#0f172a',
        accent: '#0ea5e9',
        dark: {
          bg: '#080c14',
          card: '#0f172a',
          border: '#1e293b',
          input: '#1e293b',
          hover: '#1e293b',
        },
        rose: {
          50: '#e6f7fe',
          100: '#cceefd',
          200: '#99ddfb',
          300: '#66ccf9',
          400: '#33bbf7',
          500: '#00aeef',
          600: '#009dcb',
          700: '#007ca0',
          800: '#005c77',
          900: '#003b4d',
          950: '#001c24',
        },
        violet: {
          50: '#f5f8ff',
          100: '#ebf1ff',
          200: '#d6e3ff',
          300: '#adc7ff',
          400: '#85abff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 174, 239, 0.05), 0 2px 8px -1px rgba(0, 0, 0, 0.03)',
        'soft-lg': '0 10px 30px -5px rgba(0, 174, 239, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'soft-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.3), 0 2px 8px -1px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}
