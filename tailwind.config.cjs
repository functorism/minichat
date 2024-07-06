/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    fontFamily: {
      serif: ["Cormorant Garamond", "serif"],
    },
    extend: {
      animation: {
        fade: "fadeIn 500ms ease-in-out",
      },

      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
