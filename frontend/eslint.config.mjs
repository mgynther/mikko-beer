import love from 'eslint-config-love'
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
  '@typescript-eslint/no-magic-numbers': 'off',
  'max-len': ['error', { 'code': 80, 'ignoreRegExpLiterals': true }]
}

const plugins = {
  '@typescript-eslint': typescriptEslint,
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
  }
]
