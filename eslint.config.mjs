import stylistic from '@stylistic/eslint-plugin';
import { defineConfig } from 'eslint/config';
import eslintPluginImportX from 'eslint-plugin-import-x';
import tseslint from 'typescript-eslint';

export default defineConfig([
  tseslint.configs.strict,
  tseslint.configs.recommended,
  {
    plugins: {
      '@stylistic': stylistic,
      'import-x': eslintPluginImportX,
    },
    rules: {
      'import-x/order': ['error', {
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      }],
      '@typescript-eslint/no-explicit-any': ['off'],
      '@typescript-eslint/consistent-type-imports': ['error', { disallowTypeAnnotations: true, fixStyle: 'separate-type-imports', prefer: 'type-imports' }],
      '@typescript-eslint/consistent-type-exports': ['off', { fixMixedExportsWithInlineTypeSpecifier: true }],
      '@stylistic/space-unary-ops': [1, { overrides: { '!': true } }],
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/no-trailing-spaces': ['error'],
      '@stylistic/comma-spacing': ['error', { before: false, after: true }],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/semi': 'error',
      '@stylistic/indent': ['error', 2],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/member-delimiter-style': ['error'],
      '@stylistic/no-extra-semi': ['error'],
    },
  },
]);
