import { readdirSync } from 'node:fs'
import { join } from 'node:path'

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

// Every directory under src is a layer. A layer may import only from
// itself, so that the dependencies between them stay explicit and
// reviewable. web/ is the single exception: it wires the other layers
// together and may import all of them, restricted only from reaching
// their internals.
//
// Listing the layers here and deriving the restrictions from the list
// keeps the rule impossible to state inconsistently: a new layer is
// banned from every other layer, and every other layer is banned from
// it, by adding one name.
const wiringLayer = 'web'
const layers = [
  'console',
  'crypto',
  'data',
  'jwt',
  'logic',
  'validation',
  wiringLayer,
]

// A layer that is never registered above would otherwise get no
// restrictions at all and be importable from everywhere, which is the
// one way the derivation could quietly become too permissive. Fail the
// lint instead of allowing that.
const srcDirectories = readdirSync(join(import.meta.dirname, 'src'), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
const unregisteredLayers = srcDirectories.filter(
  (directory) => !layers.includes(directory),
)
if (unregisteredLayers.length > 0) {
  throw new Error(
    `Unregistered layers under src: ${unregisteredLayers.join(', ')}. ` +
      'Every directory under src is a layer and must be listed in ' +
      'layers of eslint.config.mjs so that import restrictions are ' +
      'applied to and against it.',
  )
}

function layerFiles(layer) {
  return [`src/${layer}/*.ts`, `src/${layer}/**/*.ts`]
}

function noOtherLayerImports(layer) {
  return {
    'no-restricted-imports': [
      'error',
      {
        patterns: layers
          .filter((other) => other !== layer)
          .map((other) => ({ regex: `${other}/` })),
      },
    ],
  }
}

// web/ uses the other layers through their public modules only. Their
// internal/ directories are the layer's own business and are derived
// from the same list, so a new layer gets its internals protected
// without a separate edit here.
function noLayerInternalImports() {
  return {
    'no-restricted-imports': [
      'error',
      {
        patterns: layers
          .filter((layer) => layer !== wiringLayer)
          .map((layer) => ({ regex: `${layer}/internal/` })),
      },
    ],
  }
}

const isolatedLayerConfigs = layers
  .filter((layer) => layer !== wiringLayer)
  .map((layer) => ({
    languageOptions,
    plugins,
    files: layerFiles(layer),
    rules: {
      ...rules,
      ...noOtherLayerImports(layer),
    },
  }))

export default [
  {
    languageOptions,
    plugins,
    files: ['src/*.{js,ts,tsx,jsx}', 'src/**/*.{js,ts,tsx,jsx}'],
    rules,
  },
  ...isolatedLayerConfigs,
  {
    languageOptions,
    plugins,
    files: layerFiles(wiringLayer),
    rules: {
      ...rules,
      // The router is data agnostic and has to remain so: a RequestHandler
      // returns a Response whose body is Record<string, unknown>. An
      // inferred return type on a route handler therefore states nothing
      // about the actual response shape, and the shape has to be declared
      // by the controller. The default allowTypedFunctionExpressions lets
      // exactly those handlers off the hook, because the Router interface
      // already gives them a type, so it is turned off here.
      //
      // The annotation must be on the lambda rather than on a type
      // parameter of the router: only a return type annotation gets the
      // returned object literal checked against the declared type, which
      // is what catches excess properties in a response body. Contextual
      // typing through the router does not.
      //
      // This also requires return types on every other lambda of the
      // layer. That is accepted on purpose. The alternative, a rule
      // matching route handlers alone, has to recognize them by the name
      // of the variable they are registered on and silently stops
      // applying when that name changes.
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowTypedFunctionExpressions: false,
        },
      ],
      // Koa context requires assigning status and body.
      'no-param-reassign': 'off',
      ...noLayerInternalImports(),
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
