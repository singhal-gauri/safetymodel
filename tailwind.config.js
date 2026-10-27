/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        dash: {
          to: {
            strokeDashoffset: '-20',
          },
        },
        fadeIn: {
          from: { opacity: 0, transform: 'translateY(6px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        scaleUp: {
          from: { opacity: 0, transform: 'scale(0.92)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
      },
      animation: {
        dash: 'dash 1.5s linear infinite',
        fadeIn: 'fadeIn 0.25s ease-out forwards',
        scaleUp: 'scaleUp 0.2s ease-out forwards',
      },
    },
  },
  plugins: [],
}
