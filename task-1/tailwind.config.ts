const config = {
  darkMode: "class",
  content: [
    "./index.html",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: "#768D85",
          200: "#FFC0CB",
        },
        dark: {
          100: "#CFBFAD",
          200: "#252525",
          300: "#515E5A",
          400: "#2D2F2F",
          500: "#1E2021",
        },
        light: {
          100: "#1E2021",
          200: "#FFFFFF",
          300: "#BAC6C2",
          400: "#F1F4F3",
          500: "#FAFAFA",
        },
        border: {
          100: "#F5F5F5",
        },
      },
    },
  },
  plugins: [],
};

export default config;
