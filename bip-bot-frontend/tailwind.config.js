/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bip: {
          primary: "#0096FF",
          bg: "#0f172a0d",
          bubble: "#e9eef7",
          pill: "#b8bed0",
        },
      },
      boxShadow: { soft: "0 2px 16px rgba(0,0,0,.08)" },
      borderRadius: { xl2: "1rem" },
      backgroundImage: {
        "bip-doodles":
          "url(\"data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23cbd5e1' fill-opacity='0.25'%3E%3Ccircle cx='10' cy='10' r='2'/%3E%3Ccircle cx='60' cy='25' r='1.6'/%3E%3Ccircle cx='95' cy='50' r='1.8'/%3E%3Ccircle cx='30' cy='70' r='1.4'/%3E%3Ccircle cx='85' cy='95' r='2'/%3E%3Ccircle cx='15' cy='100' r='1.2'/%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
