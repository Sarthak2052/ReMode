/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sky Theme tokens from Design Plan Section 2
        sky: {
          DEFAULT: '#4FA8F8',
          deep: '#1C6FD9',
          light: '#EAF5FF',
          muted: '#F4FAFF',
          soft: '#D9ECFF',
        },
        horizon: {
          DEFAULT: '#0A3D73',
          dark: '#06264A',
          deep: '#041B35',
        },
        cloud: '#FFFFFF',
        ink: {
          DEFAULT: '#0F1B2B',
          muted: '#4A5B70',
          light: '#7F93A8',
        },
        caution: {
          DEFAULT: '#FFC94D',
          hover: '#EBB438',
          light: '#FFF6D9',
        },
        danger: {
          DEFAULT: '#FF5A5A',
          hover: '#E54545',
          light: '#FFEBEB',
        },
        success: {
          DEFAULT: '#2CD9B8',
          dark: '#1EAE93',
          light: '#E6FAF5',
        },
        // Semantic Canvas aliases
        canvas: {
          DEFAULT: '#EAF5FF',
          calm: '#EAF5FF',
          subtle: '#F4FAFF',
          card: '#FFFFFF',
          dark: '#0A3D73',
          paper: '#FAF7F2',
        },
        // Compatibility palette
        plum: {
          DEFAULT: '#0A3D73',
          dark: '#06264A',
          light: '#EAF5FF',
        },
        amberGold: {
          DEFAULT: '#FFC94D',
          hover: '#EBB438',
          light: '#FFF6D9',
        },
        coralRed: {
          DEFAULT: '#FF5A5A',
          hover: '#E54545',
          light: '#FFEBEB',
        },
        sageGreen: {
          DEFAULT: '#2CD9B8',
          dark: '#1EAE93',
          soft: '#E6FAF5',
        },
        lavenderPuff: {
          DEFAULT: '#C3DCFF',
          dark: '#4FA8F8',
          light: '#F4FAFF',
        },
      },
      fontFamily: {
        anton: ['"Anton"', 'sans-serif'],
        display: ['"Fredoka"', '"Fraunces"', 'system-ui', 'sans-serif'],
        serif: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        handwritten: ['"Caveat"', '"Patrick Hand"', 'cursive'],
        fascinate: ['"Fascinate Inline"', 'cursive', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'brutal': '3px 3px 0px #0F1B2B',
        'brutal-lg': '5px 5px 0px #0F1B2B',
        'brutal-xl': '8px 8px 0px #0F1B2B',
        'brutal-sm': '2px 2px 0px #0F1B2B',
        'brutal-sky': '4px 4px 0px #1C6FD9',
        'brutal-amber': '4px 4px 0px #FFC94D',
        'brutal-teal': '4px 4px 0px #2CD9B8',
        'brutal-white': '3px 3px 0px #FFFFFF',
      },
      borderRadius: {
        'brutal': '16px',
        'pill': '9999px',
        'card': '20px',
      },
    },
  },
  plugins: [],
};
