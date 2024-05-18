module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: 'love',
  overrides: [
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/naming-convention': [
      'error',
      {
        'selector': 'variable',
        'format': ['camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE'],
      },
    ],
    'max-len': ['error', { 'code': 80, 'ignoreRegExpLiterals': true }]
  },
  overrides: [
    {
      files: ['src/core/*.ts', 'src/core/**/*.ts'],
      rules: {
        'no-restricted-imports': ['error',
          { patterns: ['data', 'web'] }
        ]
      }
    },
    {
      files: ['src/data/*.ts', 'src/data/**/*.ts'],
      rules: {
        'no-restricted-imports': ['error',
          { patterns: ['web'] }
        ]
      }
    }
  ]
}
