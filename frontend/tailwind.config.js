/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          600: "#2563eb",
          700: "#1d4ed8",
        },
        green: {
          600: "#16a34a",
          700: "#15803d",
        },
        red: {
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
        },
        purple: {
          600: "#9333ea",
        },
      },
      borderRadius: {
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};
