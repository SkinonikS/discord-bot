import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';

export default tseslint.config(
  {
    files: ['**/*.ts', '**/*.mjs'],
    ignores: ['node_modules', 'dist'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { disallowTypeAnnotations: true, prefer: 'no-type-imports' }],
      '@typescript-eslint/consistent-type-exports': ['off', { fixMixedExportsWithInlineTypeSpecifier: false }],
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
);
