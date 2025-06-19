module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class', // updated from the older 'false' setting
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
