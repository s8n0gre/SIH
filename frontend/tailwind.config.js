/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'pulse': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 3s infinite',
        'spin': 'spin 3s linear infinite',
        'ping': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      colors: {
        // Material Black overrides — applied globally in dark mode
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#1e1e1e',   // dark: subtle dividers / hover surfaces
          700: '#141414',   // dark: raised cards over panels
          800: '#0a0a0a',   // dark: panels, sidebars, modals
          900: '#000000',   // dark: page background — pure Material Black
        },
      },
    },
  },
  plugins: [],
};