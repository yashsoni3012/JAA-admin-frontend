/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand blues taken from the Members Approval reference design
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#4F5BD5',
          600: '#3F4BC4',
          700: '#333DA8',
        },
        surface: '#F4F7FD',
        ink: '#1B1F3B',
      },
      boxShadow: {
        active: '0 10px 25px -5px rgba(79, 91, 213, 0.45)',
        card: '0 4px 20px -4px rgba(27, 31, 59, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
