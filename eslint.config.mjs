import eslint from '@eslint/js';
import jsoneslint from 'eslint-plugin-jsonc';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  jsoneslint.configs['flat/recommended-with-json'],
  {
    ignores: ['!**/*', '**/node_modules/', '**/dist'],
  },
);
