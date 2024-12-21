import love from 'eslint-config-love'
import eslintComments from 'eslint-plugin-eslint-comments'
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
  '@typescript-eslint/naming-convention': [
    'error',
    {
      'selector': 'variable',
      'format': ['camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE'],
    },
  ],
  'complexity': 'off',
  '@typescript-eslint/no-magic-numbers': 'off',
  '@typescript-eslint/max-params': 'off',
  '@typescript-eslint/prefer-destructuring': 'off',
  'max-len': ['error', { 'code': 80, 'ignoreRegExpLiterals': true }],
  'max-lines': 'off'
}

const plugins = {
  '@typescript-eslint': typescriptEslint,
  'eslint-comments': eslintComments,
  'import': pluginImport,
  'n': pluginN,
  'promise': pluginPromise
}

export default [
  {
    ...love,
    languageOptions,
    files: ['src/*.{js,ts,tsx,jsx}'],
    plugins,
    rules,
  },
  {
    languageOptions,
    files: ['src/core/*.ts', 'src/core/**/*.ts'],
    plugins,
    rules: {
      ...rules,
      'no-restricted-imports': ['error',
        { patterns: ['data', 'web'] }
      ]
    }
  },
  {
    languageOptions,
    files: ['src/data/*.ts', 'src/data/**/*.ts'],
    plugins,
    rules: {
      ...rules,
      'no-restricted-imports': ['error',
        { patterns: ['web'] }
      ]
    }
  },
  {
    languageOptions,
    files: ['src/data/migrations/*.ts'],
    plugins,
    rules: {
      ...rules,
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
]
