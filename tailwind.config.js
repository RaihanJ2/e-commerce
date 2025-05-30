/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        gothic: ["Didact Gothic", "sans-serif"],
      },
      colors: {
        primary: {
          lightest: "#E9EDF3",
          light: "#7EA7BF",
          medium: "#4D58C0",
          dark: "#6C6C90",
          darkest: "#252F4E",
        },
      },
    },
  },

  plugins: [],
};
