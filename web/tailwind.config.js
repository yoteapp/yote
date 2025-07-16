// This file uses .cjs extension to ensure compatibility with Node.js environments that do not support ES modules natively.
// specifically node_modules/tailwindcss/lib/lib/setupTrackingContext.js, it throws an error if the file is not a CommonJS module.

/** @type {import('tailwindcss').Config} */
export default {
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
