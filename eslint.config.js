import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11yX from 'eslint-plugin-jsx-a11y-x';
import betterTailwind from 'eslint-plugin-better-tailwindcss';
import { importX } from 'eslint-plugin-import-x';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import unicorn from 'eslint-plugin-unicorn';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default defineConfig([
  { ignores: ['dist/', '.astro/', 'node_modules/', 'coverage/'] },
  js.configs.recommended,
  tseslint.configs.strict,
  astro.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx,astro}', 'scripts/**/*.{js,mjs,ts}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx,astro}'],
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        { allowExpressions: true },
      ],
      'max-lines': [
        'warn',
        { max: 300, skipBlankLines: true, skipComments: true },
      ],
    },
  },
  {
    files: ['**/*.tsx'],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'jsx-a11y-x': jsxA11yX,
    },
    rules: {
      ...jsxA11yX.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    files: ['*.{js,mjs,cjs,ts}', 'scripts/**/*.{js,mjs,ts}'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['**/*.{tsx,astro}'],
    extends: [betterTailwind.configs['recommended-error']],
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/modules/common/styles/global.css',
      },
    },
    rules: {
      'better-tailwindcss/enforce-consistent-class-order': 'off',
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
    },
  },
  {
    files: ['src/**/*.{ts,tsx,astro,js,mjs}', 'scripts/**/*.{js,mjs,ts}'],
    plugins: { unicorn },
    rules: {
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
          ignore: [String.raw`^\[.+\]\.(astro|ts)$`],
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'import-x': importX },
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({ project: './tsconfig.json' }),
      ],
    },
    rules: {
      'import-x/no-cycle': 'error',
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'type',
          ],
          pathGroups: [{ pattern: '@/**', group: 'internal' }],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx,astro}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/modules/*/*',
                '!@/modules/common/**',
                '!@/modules/*/server',
              ],
              message:
                'Impor modul lain lewat @/modules/<nama>. Di dalam modul sendiri pakai path relatif.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/modules/*/*', '!@/modules/common/**'],
              message:
                'Impor modul lain lewat @/modules/<nama>. Kode */server tidak boleh dipakai di React.',
            },
          ],
        },
      ],
    },
  },
  prettier,
]);
