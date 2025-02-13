import jsoncParser from 'jsonc-eslint-parser';
import rootConfig from '../../eslint.config.mjs';

export default [
  ...rootConfig,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        project: ['./tsconfig.json'],
      },
    },
  },
  {
    files: ['**/*.json'],
    languageOptions: {
      parser: jsoncParser,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'], // Target TypeScript files
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-invalid-void-type': 'off',
    },
  },
];
