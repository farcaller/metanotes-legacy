/* eslint-disable */

module.exports = {
  plugins: [
    'react',
    '@typescript-eslint/eslint-plugin',
    'tsdoc',
    'jest',
    'header',
    'disable',
  ],
  extends: [
    'prettier/react',
  ],
  processor: 'disable/disable',
  overrides: [
    {
      files: ["src/scribblefs/**/*.metanotes.jsx"],
      settings: {
        'disable/plugins': ['@typescript-eslint'],
      },
      globals: {
        React: 'readonly',
        core: 'readonly',
        components: 'readonly',
      }
    }
  ]
};
