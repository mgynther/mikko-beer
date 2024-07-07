const love = require('eslint-config-love')
const typescriptEslint = require('@typescript-eslint/eslint-plugin')
const pluginImport = require('eslint-plugin-import')
const pluginN = require('eslint-plugin-n')
const pluginPromise = require('eslint-plugin-promise')
const typescriptEslintParser = require('@typescript-eslint/parser')

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
  'max-len': ['error', { 'code': 80, 'ignoreRegExpLiterals': true }]
}

const plugins = {
  '@typescript-eslint': typescriptEslint,
  'import': pluginImport,
  'n': pluginN,
  'promise': pluginPromise
}

module.exports = [
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
  }
]
