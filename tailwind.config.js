/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'sm': '425px', 
        'xsm': '375px',
        'xxsm': '320px',
      },
    },
  },
  plugins: [],
};
