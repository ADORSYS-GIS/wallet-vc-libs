import eslint from '@eslint/js';

import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import jsoncParser from 'jsonc-eslint-parser';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['node_modules', '**/build/**', '**/dist/**', '**/node_modules/**'],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.strict,
  {
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'simple-import-sort': pluginSimpleImportSort,
    },
    languageOptions: {
      parser: tseslint.parser,
      globals: {
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'], // Side effect imports
            ['^react'],    // React-related imports
            ['^@'],        // Imports starting with '@'
            ['^[a-z]'],    // Other packages
            ['^\\.'],      // Relative imports
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
      },
    },
  },
  {
    files: ['**/*.json'],
    languageOptions: {
      parser: jsoncParser,
    },
  },
  {
    files: ['**/*.d.ts', '**/*.test.ts', '**/*.test.js'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
);
