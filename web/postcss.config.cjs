// This file uses .cjs extension to ensure compatibility with Node.js environments that do not support ES modules natively.
// specifically node_modules/tailwindcss/lib/lib/setupTrackingContext.js, it throws an error if the file is not a CommonJS module.
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-flexbugs-fixes': {},
    'postcss-preset-env': {
      autoprefixer: {
        flexbox: 'no-2009',
      },
      stage: 3,
    },
  },
};
