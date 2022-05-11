module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'preact',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'jest/no-deprecated-functions': 'off',
    curly: ['error', 'multi-line'],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'no-undef': 'off',
    '@typescript-eslint/triple-slash-reference': 'off',
    'react/jsx-key': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { destructuredArrayIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-empty-interface': 'off',
    'prefer-template': 'off',
  },
  overrides: [
    {
      files: ['*.d.ts'],
      rules: { 'no-var': 'off' },
    },
    {
      files: ['./src/**'],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
          './ts-configs/client-tsconfig.json',
          './ts-configs/static-build-tsconfig.json',
          './ts-configs/workers-tsconfig.json',
        ],
      },
    },
  ],
  globals: { navigation: 'readonly' },
};
