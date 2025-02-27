import parser from 'jsonc-eslint-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import rootConfig from '../../eslint.config.mjs';
import jsoncParser from 'jsonc-eslint-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

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
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['@adorsys-gis/**/src/**'],
        },
      ],
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
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-invalid-void-type': 'off',
    },
  },
];
