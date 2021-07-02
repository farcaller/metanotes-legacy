// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
  root: true,
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx', '.js', '.jsx'],
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.eslint.json',
      },
      [path.resolve('./tools/ts_resolver')]: {},
    },
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'import',
    'react',
    'react-native',
    '@typescript-eslint',
    'header',
    'jsdoc',
  ],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'airbnb',
    'airbnb/hooks',
    'plugin:jsdoc/recommended',
  ],
  rules: {
    'import/extensions': ['error', 'never'],
    'no-undef': ['off'],
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx', '.jsx', '.js', '.jsx'] }],
    'max-len': ['error', {
      code: 120,
      tabWidth: 2,
      ignoreComments: true,
    }],
    'header/header': ['error', 'tools/header.js'],
    // see https://github.com/airbnb/javascript/blob/master/packages/eslint-config-airbnb-base/rules/style.js#L338
    // and https://github.com/airbnb/javascript/issues/1271
    // for the discussion on the below.
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        // eslint-disable-next-line max-len
        message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
    'no-plusplus': ['off'],
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    'object-curly-newline': ['error', {
      ObjectExpression: { consistent: true },
      ObjectPattern: { multiline: true },
      ImportDeclaration: { multiline: true, minProperties: 5 },
      ExportDeclaration: { multiline: true, minProperties: 3 },
    }],
    'no-continue': ['off'],
    'no-param-reassign': ['error', { props: false }],
    'import/no-deprecated': ['warn'],
    'newline-per-chained-call': ['warn', { ignoreChainWithDepth: 3 }],

    'no-use-before-define': ['off'],
    '@typescript-eslint/no-use-before-define': ['error'],
    'no-useless-constructor': ['off'],
    '@typescript-eslint/no-useless-constructor': ['error'],
    'no-unused-vars': ['off'],
    '@typescript-eslint/no-unused-vars': ['error', {
      varsIgnorePattern: '^_',
      argsIgnorePattern: '^_',
    }],
    'no-empty-function': ['off'],
    '@typescript-eslint/no-empty-function': ['error'],
    'jsdoc/require-returns-type': ['off'],
    'jsdoc/require-param-type': ['off'],
    'jsdoc/require-description-complete-sentence': ['warn'],
    'jsdoc/require-jsdoc': ['warn', {
      contexts: [
        'ClassDeclaration',
        'ClassProperty',
        'FunctionDeclaration',
        'MethodDefinition:not([key.name="toString"], [kind="get"])',
      ],
    }],
    'jsdoc/require-description': ['warn', {
      contexts: [
        'ClassDeclaration',
        'ClassProperty',
        'FunctionDeclaration',
        'MethodDefinition:not([key.name="toString"], [kind="get"])',
      ],
    }],
    'jsdoc/require-returns': ['warn', {
      checkGetters: false,
    }],
    'jsdoc/check-tag-names': ['warn', {
      definedTags: ['internal'],
    }],
    'react-native/no-unused-styles': 2,
    'react-native/split-platform-components': 2,
    'react-native/no-inline-styles': 2,
    'react-native/no-color-literals': 2,
    'react-native/no-raw-text': 2,
    'react-native/no-single-element-style-arrays': 2,
  },
  overrides: [
    {
      files: [
        'src/frontend/scribbles/**/*.ts',
        'src/frontend/scribbles/**/*.tsx',
      ],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': ['off'],
        'import/named': ['off'],
        'import/no-unresolved': ['off'],
        '@typescript-eslint/no-var-requires': ['off'],
        'jsdoc/require-jsdoc': ['off'],
      },
    },
    {
      files: ['tools/*.js', '*.test.ts', '*.test.tsx'],
      rules: {
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
        'jsdoc/require-jsdoc': ['off'],
        'no-console': ['off'],
      },
    },
    {
      files: ['dist/bin/**/*.ts', 'bazel-out/**/*.ts'],
      rules: {
        'header/header': ['off'],
      },
    },
  ],
};
