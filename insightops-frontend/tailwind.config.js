export default {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 18px 50px rgba(15, 23, 42, 0.08)",
        glow: "0 0 36px rgba(37, 99, 235, 0.18)",
      },
    },
  },
  plugins: [],
};
