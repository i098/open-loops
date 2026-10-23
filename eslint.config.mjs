import globals from 'globals';

export default [
  { ignores: ['node_modules/**', 'dist/**', 'test-results/**', 'playwright-report/**'] },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
    },
    rules: {
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-dupe-args': 'error',
      'no-dupe-else-if': 'error',
      'no-dupe-keys': 'error',
      'no-unsafe-finally': 'error',
      'valid-typeof': 'error',
      'constructor-super': 'error',
    },
  },
  {
    files: ['scripts/**/*.{js,mjs}', 'tests/**/*.{js,mjs}', '*.mjs'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['previews/assets/**/*.mjs'],
    languageOptions: { globals: globals.browser, sourceType: 'module' },
  },
  {
    files: ['previews/assets/**/*.js'],
    languageOptions: { globals: globals.browser, sourceType: 'script' },
  },
];
