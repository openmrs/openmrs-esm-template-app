import openmrs from '@openmrs/eslint-config';

export default [
  { ignores: ['dist/**', 'coverage/**'] },
  ...openmrs,
  {
    rules: {
      '@typescript-eslint/triple-slash-reference': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    // Playwright fixtures take a callback named `use` and call it, which
    // eslint-plugin-react-hooks reads as React's `use` hook.
    files: ['e2e/**'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
];
