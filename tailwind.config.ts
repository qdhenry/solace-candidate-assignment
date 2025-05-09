import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const btnSecondary = plugin(function({ addComponents }) {
  addComponents({
    ".btn-secondary": {
      color: "#000",
      textAlign: "center",
      backgroundColor: "#d7a13b",
      backgroundImage: "linear-gradient(45deg, #deb260, #d39009)",
      borderRadius: "10px",
      padding: "1rem 2.5rem",
      fontFamily: "Lato, sans-serif",
      fontSize: "1.1rem",
      fontWeight: "700",
      lineHeight: "150%",
      transition: "bottom .2s, box-shadow .2s",
      position: "relative",
      bottom: "0",
      boxShadow: "0 2px 17px 2px #afc8bf4d, inset 0 2px 4.7px #fff6",
    },
  });
});

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      'headline': ['Mollie Glaston', 'serif'],
      'body': ['Lato', 'sans-serif'],
    
    },
       colors: {
        'solace-green': {
          DEFAULT: '#2A7F62', // Main brand green
          'light': '#C6D8D3', // Lighter background green
        },
        'solace-gold': '#D9A44D',   // Accent gold/mustard

        'background': {
          DEFAULT: '#FFFFFF',       // Main white background
          'subtle': '#EFF5F4',     // Very light tinted background (e.g., hero)
        },

        'text-color': { // Renamed to avoid conflict with Tailwind's 'text' utility prefix
          'primary': '#1E1E1E',      // Darkest text, for headings
          'secondary': '#545454',    // Standard body text
          'muted': '#868686',
          'white': '#FFFFFF', // Lighter, less emphasized text
        },
        // You could also add specific grays if needed:
        // 'gray': {
        //   '900': '#1E1E1E',
        //   '700': '#545454',
        //   '500': '#868686',
        // }
      },
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [btnSecondary],
};

export default config;
