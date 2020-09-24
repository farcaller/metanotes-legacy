/* eslint-disable */

module.exports = {
  plugins: [
    'react',
    '@typescript-eslint/eslint-plugin',
    'tsdoc',
    'jest',
    'header',
  ],
  extends: [
    'prettier/react',
  ],
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
};
