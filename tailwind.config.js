/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
      extend: {
        colors: {
          primary: "#0077FF",
          instagram: 'linear-gradient(to right, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)'
        }
      },
    },
    plugins: [],
  };