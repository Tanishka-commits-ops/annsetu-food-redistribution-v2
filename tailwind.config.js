/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: "#123B2B",
        moss: "#1D5A41",
        lime: "#D7F267",
        paper: "#F7F7F2",
        ink: "#173026"
      },
      boxShadow: {
        soft: "0 10px 35px rgba(18, 59, 43, 0.08)"
      }
    }
  },
  plugins: []
};
