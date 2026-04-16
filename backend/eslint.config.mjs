import eslint from '@eslint/js'
import tsEslint from 'typescript-eslint'

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
    'typescript-eslint recommended languageOptions were not found from where they used to be.',
  )
}

const tsEslintPlugins = tsEslint.configs.recommended[0].plugins
if (tsEslintPlugins === undefined) {
  throw new Error(
    'typescript-eslint recommended plugins were not found from where they used to be.',
  )
}

const tsEslintRules = tsEslint.configs.recommended.reduce((rules, item) => {
  if (item.rules === undefined) {
    return rules
  }
  return {
    ...rules,
    ...item.rules,
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
  ...tsEslintPlugins,
}

const commonRules = {
  ...eslint.configs.recommended.rules,
  ...tsEslintRules,
}

const rules = {
  ...commonRules,

  'max-len': [
    'error',
    {
      code: 80,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
    },
  ],
  'no-await-in-loop': 'error',
  'require-atomic-updates': 'error',
  '@typescript-eslint/naming-convention': [
    'error',
    {
      selector: 'variable',
      format: ['camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE'],
    },
  ],
  '@typescript-eslint/consistent-type-imports': [
    'error',
    {
      fixStyle: 'separate-type-imports',
      prefer: 'type-imports',
    },
  ],
  '@typescript-eslint/explicit-function-return-type': 'error',
  '@typescript-eslint/no-unsafe-type-assertion': 'error',
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      args: 'all',
      argsIgnorePattern: '^_',
      caughtErrors: 'all',
      caughtErrorsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true,
    },
  ],
  '@typescript-eslint/require-await': 'error',

  complexity: 'off',
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
    plugins,
    files: ['src/*.{js,ts,tsx,jsx}', 'src/**/*.{js,ts,tsx,jsx}'],
    rules,
  },
  {
    languageOptions,
    plugins,
    files: ['src/core/*.ts', 'src/core/**/*.ts'],
    rules: {
      ...rules,
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: 'data/',
            },
            {
              regex: 'web/',
            },
          ],
        },
      ],
    },
  },
  {
    languageOptions,
    plugins,
    files: ['src/data/*.ts', 'src/data/**/*.ts'],
    rules: {
      ...rules,
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: 'web/',
            },
            {
              regex: 'core/internal/',
            },
          ],
        },
      ],
    },
  },
  {
    languageOptions,
    plugins,
    files: ['src/web/*.ts', 'src/web/**/*.ts'],
    rules: {
      ...rules,
      // Koa context requires assigning status and body.
      'no-param-reassign': 'off',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: 'core/internal/',
            },
          ],
        },
      ],
    },
  },
  {
    languageOptions,
    plugins,
    files: ['src/data/migrations/*.ts'],
    rules: {
      ...rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  {
    languageOptions: {
      ...languageOptions,
      parserOptions: {
        project: ['./tsconfig-test.json'],
      },
    },
    files: ['test/*.test.ts', 'test/**/*.test.ts'],
    plugins,
    rules: {
      ...rules,
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/strict-void-return': 'off',
    },
  },
]
