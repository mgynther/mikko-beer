import love from 'eslint-config-love'
import eslintComments from '@eslint-community/eslint-plugin-eslint-comments'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import pluginImport from 'eslint-plugin-import'
import pluginN from 'eslint-plugin-n'
import pluginPromise from 'eslint-plugin-promise'
import typescriptEslintParser from '@typescript-eslint/parser'

const languageOptions = {
  globals: {
    browser: true,
    es2021: true,
  },
  parser: typescriptEslintParser,
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
}

const rules = {
  ...love.rules,
  'complexity': 'off',
  '@typescript-eslint/naming-convention': [
    'error',
    {
      'selector': 'variable',
      'format': ['camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE'],
    },
  ],
  '@typescript-eslint/no-magic-numbers': 'off',
  '@typescript-eslint/prefer-destructuring': 'off',
  'max-len': ['error', { 'code': 80, 'ignoreRegExpLiterals': true }],
  'max-lines': 'off',
  'no-console': 'off'
}

const plugins = {
  '@typescript-eslint': typescriptEslint,
  '@eslint-community/eslint-comments': eslintComments,
  'import': pluginImport,
  'n': pluginN,
  'promise': pluginPromise
}

export default [
  {
    ...love,
    languageOptions,
    files: ['src/*.{js,ts,tsx,jsx}', 'src/**/*.{js,ts,tsx,jsx}'],
    plugins,
    rules,
  },
  {
    ...love,
    languageOptions,
    files: ['src/store/**/reducer.ts'],
    plugins,
    rules: {
      ...rules,
      // Slices rely heavily on reassign as per RTK design.
      'no-param-reassign': 'off'
    }
  },
  {
    ...love,
    languageOptions,
    files: ['src/*.test.{js,ts,tsx,jsx}', 'src/**/*.test.{js,ts,tsx,jsx}'],
    plugins,
    rules: {
      ...rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/strict-void-return': 'off'
    }
  },
  {
    ignores: [
      '*.css',
      '*.svg',
      '*.json',
      'vite.config.ts',
      'vitest.config.ts'
    ]
  }
]
