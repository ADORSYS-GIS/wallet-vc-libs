import tseslint from 'typescript-eslint';
import workspaceConfig from '../../eslint.config.mjs';

export default tseslint.config(workspaceConfig, {
  rules: {
    'no-restricted-imports': [
      'error',
      { patterns: ['@adorsys-gis/**/src/**'] },
    ],
  },
});
