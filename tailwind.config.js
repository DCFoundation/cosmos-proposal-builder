/* global require */

const sans = [
  "Roboto",
  "ui-sans-serif",
  "system-ui",
  "-apple-system",
  "BlinkMacSystemFont",
  "Segoe UI",
  "Helvetica Neue",
  "Arial",
  "Noto Sans",
  "sans-serif",
  "Apple Color Emoji",
  "Segoe UI Emoji",
  "Segoe UI Symbol",
  "Noto Color Emoji",
];

/** @type {import('tailwindcss').Config} */
export default {
  mode: "jit", // update this line
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgba(var(--color-primary), <alpha-value>)",
        secondary: "rgba(var(--color-secondary), <alpha-value>)",
        alternative: "rgba(var(--color-alternative), <alpha-value>)",
        cardinal: {
          50: "#fef2f2",
          100: "#fce8e7",
          200: "#f9d2d4",
          300: "#f4adb0",
          400: "#ed7f86",
          500: "#e1525e",
          600: "#bb2d40",
          700: "#ac2439",
          800: "#902137",
          900: "#7c1f34",
          950: "#450c17",
        },
        "wild-sand": {
          50: "#f4f4f4",
          100: "#efefef",
          200: "#dcdcdc",
          300: "#bdbdbd",
          400: "#989898",
          500: "#7c7c7c",
          600: "#656565",
          700: "#525252",
          800: "#464646",
          900: "#3d3d3d",
          950: "#292929",
        },
        disabled: "rgba(var(--color-disabled), <alpha-value>)",
      },
      boxShadow: {
        card: "0 22px 34px rgba(116,116,116,0.25)",
      },
      borderRadius: {
        10: "10px",
        20: "20px",
      },
      fontFamily: {
        sans,
        serif: [
          "Roboto Slab",
          "ui-serif",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "Times",
          "serif",
        ],
        altSans: ["Mulish", ...sans],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
