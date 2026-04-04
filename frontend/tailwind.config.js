/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Source Sans 3", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Bree Serif", "ui-serif", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
}

