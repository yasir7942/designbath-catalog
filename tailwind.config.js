/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {

      keyframes: {
        colorChange: {
          '0%, 100%': { color: '#ffffff' },  // Start and end with red
          '50%': { color: '#f87171' },       // Change to blue at the midpoint
        },
      },
      animation: {
        colorChange: 'colorChange 2s infinite',
      },

      
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
