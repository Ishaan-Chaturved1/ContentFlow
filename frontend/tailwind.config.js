/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FDFCF9',
          100: '#FAF8F4',
          200: '#F3EFE7',
          300: '#E7E1D4',
          400: '#D5CCC0',
        },
        charcoal: {
          950: '#0F1210',
          900: '#181B19',
          800: '#232825',
          700: '#353D38',
          600: '#4D5852',
          500: '#6C7871',
          400: '#929F98',
          300: '#B8C2BC',
        },
        olive: {
          50: '#F4F6F3',
          100: '#E4EAE2',
          200: '#C9D6C5',
          500: '#5A6B53',
          600: '#4B5A45',
          700: '#3B4736',
          800: '#2C3528',
        },
        taupe: {
          50: '#FBF9F7',
          100: '#F4EFEB',
          200: '#E5DBD3',
          300: '#CEBEB3',
          500: '#8C7D71',
          600: '#73655A',
        },
        sand: '#EFEBE4',
        borderMuted: '#E2DCD3',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'elevated': '0 8px 24px -4px rgba(24, 27, 25, 0.08), 0 2px 6px -1px rgba(24, 27, 25, 0.04)',
      }
    },
  },
  plugins: [],
}
