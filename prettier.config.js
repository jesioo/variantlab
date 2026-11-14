/** @type {import('prettier').Config} */
export default {
  semi: true,
  singleQuote: true,
  printWidth: 100,
  trailingComma: 'es5',
  arrowParens: 'always',
  endOfLine: 'lf',
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: './playground/src/styles.css',
};
