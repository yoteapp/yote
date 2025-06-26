module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  corePlugins: {
    preflight: true, // NOTE: to implement styles across browser
  },
  theme: {
    extend: {
      colors: {
        // Add custom color pallettes here...
        // orange: {
        //   500: '#FB6440'
        // }
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
