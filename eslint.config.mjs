import eslint from '@eslint/js';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import jsoncParser from 'jsonc-eslint-parser';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
   ignores: [
    'node_modules', 
    '**/build/**', 
    '**/dist/**', 
    '**/node_modules/**',
    '**/*.mjs'
  ],
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
            ['^\\u0000'],          // Side effect imports
            ['^react', '^next'],   // React & Next.js imports (if applicable)
            ['^@/'],               // Project-specific aliases (like '@/components')
            ['^[a-z]'],            // External packages
            ['^\\.\\.(?!/?$)'],    // Parent imports (../)
            ['^\\./(?=.*/)(?!/?$)'], // Sibling imports with subfolders
            ['^\\./?$'],           // Same-folder imports (./)    
          ],
        },
      ],
      // Rules for better TypeScript safety
      '@typescript-eslint/no-floating-promises': 'error', // Ensures Promises are handled
      '@typescript-eslint/await-thenable': 'error', // Ensures `await` is only used on Promises
      '@typescript-eslint/no-misused-promises': 'error', // Prevents misuse of Promises in logical expressions
    },
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parserOptions: {
        project: true,
        projectService: true,
        ecmaVersion: 'latest',
      },
    },
  },
  {
    files: ['**/*.json'],
      languageOptions: {
        parser: jsoncParser,
      },
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
  },
  },
  {
    files: ['**/*.d.ts', '**/*.test.ts', '**/*.test.js', '**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
);