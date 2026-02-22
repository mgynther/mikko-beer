import eslint from '@eslint/js';
import tsEslint from 'typescript-eslint';

// Leaving below for debugging when recommended especially in typescript-eslint
// is inevitable broken in the future.
/*
console.log('eslint recommended:', JSON.stringify(eslint.configs.recommended, null, 2))
console.log('typescript eslint keys 0', Object.keys(tsEslint.configs.recommended[0]))
console.log('typescript eslint keys 1', Object.keys(tsEslint.configs.recommended[1]))
console.log('typescript eslint keys 2', Object.keys(tsEslint.configs.recommended[2]))
*/

const tsEslintLanguageOptions = tsEslint.configs.recommended[0].languageOptions
if (tsEslintLanguageOptions === undefined) {
  throw new Error(
    'typescript-eslint recommended languageOptions were not found from where they used to be.'
  )
}

const tsEslintPlugins = tsEslint.configs.recommended[0].plugins
if (tsEslintPlugins === undefined) {
  throw new Error(
    'typescript-eslint recommended plugins were not found from where they used to be.'
  )
}

const tsEslintRules = tsEslint.configs.recommended.reduce((rules, item) => {
  if (item.rules === undefined) {
    return rules
  }
  return {
    ...rules,
    ...item.rules
  }
}, {})

const languageOptions = {
  ...tsEslintLanguageOptions,
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
}

const plugins = {
  ...tsEslintPlugins
}

const commonRules = {
  ...eslint.configs.recommended.rules,
  ...tsEslintRules
}

const rules = {
  ...commonRules,

  'max-len': ['error', { 'code': 80, 'ignoreRegExpLiterals': true }],
  'no-await-in-loop': 'error',
  'require-atomic-updates': 'error',
  '@typescript-eslint/naming-convention': [
    'error',
    {
      'selector': 'variable',
      'format': ['camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE'],
    },
  ],
  '@typescript-eslint/explicit-function-return-type': 'error',
  '@typescript-eslint/no-unsafe-type-assertion': 'error',
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      'args': 'all',
      'argsIgnorePattern': '^_',
      'caughtErrors': 'all',
      'caughtErrorsIgnorePattern': '^_',
      'destructuredArrayIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
      'ignoreRestSiblings': true
    }
  ],
  '@typescript-eslint/require-await': 'error',

  'complexity': 'off',
  'max-lines': 'off',
  'no-console': 'off',
  'require-await': 'off',
  '@typescript-eslint/no-magic-numbers': 'off',
  '@typescript-eslint/max-params': 'off',
  '@typescript-eslint/prefer-destructuring': 'off',
}

export default [
  {
    languageOptions,
    files: ['src/*.{js,ts,tsx,jsx}', 'src/**/*.{js,ts,tsx,jsx}'],
    plugins,
    rules,
  },
  {
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
