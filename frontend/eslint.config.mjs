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

  'max-len': ['error', { code: 80, ignoreRegExpLiterals: true }],
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

// Every directory under src is a layer, and every layer but wiring stands on
// its own: layerImports below is empty for all of them. What a layer needs
// from another arrives as a function that wiring hands it, and the shapes it
// works on it declares itself, so a change to a shape is a change to one
// layer at a time and each layer compiles and tests with nothing else in the
// room. The copies meet in wiring, where assigning a storehook to the
// interface components/types declares is what checks them against each
// other: no cast bridges them, and an optional property never stands in for
// one that is explicitly undefined.
//
// Composition is a layer rather than a set of files directly under src so that
// it can be named in the bans. A relative import carries no layer in its path,
// so src/components/beer/Beers.tsx importing '../../App' matched no pattern
// and was allowed; 'wiring/App' matches, and is not.
//
// Deriving the restrictions from a list keeps the rule impossible to state
// inconsistently: a new layer is banned from every layer it is not given, and
// is banned from every other layer, by adding one name.
const layers = [
  'components',
  'routing',
  'store',
  'storehooks',
  'validation',
  'wiring',
]

// The layers each layer may import. Files directly under src belong to no
// layer and may import all of them, so they get no entry here. In practice
// that is index.tsx reaching for wiring/ alone.
const layerImports = {
  // The interfaces the components are written against are components/types/,
  // inside the layer they describe, so the components need no other layer at
  // all.
  components: [],
  routing: [],
  store: [],
  // storehooks implements the interfaces out of the store's public functions
  // and the validators, and imports neither. Both arrive from wiring as
  // functions, so what a response means, how it is fetched and what is done
  // with it are three layers that no longer have to change together.
  // Unwrapping the single member envelope a response arrives in stays here,
  // between the two.
  storehooks: [],
  validation: [],
  wiring: ['components', 'routing', 'store', 'storehooks', 'validation'],
}

// The layers that keep their workings behind an internal/ directory. Every
// other layer may import the layer itself and nothing below that line, the
// way the backend states the same rule. Deriving the bans from this list
// rather than naming one directory at a time means the next layer that wants
// internals gets them by being added here.
//
// components/internal/ is most of the components: only the ones wiring routes
// to, and the few pieces it hands them, are public. store/internal/ is the
// state container whole.
const layersWithInternals = ['components', 'store']

const unknownInternals = layersWithInternals.filter(
  (layer) => !layers.includes(layer),
)
if (unknownInternals.length > 0) {
  throw new Error(
    `Unknown layers in layersWithInternals: ${unknownInternals.join(', ')}. ` +
      'A name that is not a layer protects nothing.',
  )
}

// The external packages each layer may import. Anything not listed here cannot
// be imported by that layer, so taking a new dependency into use is a
// deliberate, reviewable act: it has to be given a layer first. Giving it
// exactly one layer is what keeps a breaking change in it contained, because
// every other layer works on shapes it declares itself.
//
// components/types/ is where the interfaces the components are written
// against live, and it imports nothing at all. That is what keeps the
// contracts immune to dependency upgrades: everything the interfaces need
// arrives as a callback or a plain value supplied by wiring.
const layerDependencies = {
  components: ['react', 'uuid'],
  // routing owns moving around the application, the parameters of the current
  // url and the search parameters that survive navigation. react-router is not
  // confined to it: Link and the router itself are components, and dragging
  // them in here would make routing a component layer.
  routing: ['react', 'react-router'],
  // The store owns the state container whole: reduxjs/toolkit, and
  // react-redux for installing it into the component tree and reading it from
  // there. Both stay in internal/, so that what the rest of the application
  // sees is functions and a provider component rather than redux. Two files
  // import react-redux and nothing else may, which is the rule this whole
  // file exists to make real: reduxjs/toolkit replaces a lot of react-redux
  // but does not wrap it completely, so it is too easy to reach past the
  // better alternative by accident.
  //
  // The backend url is derived in internal/config/ from the environment,
  // which is plain parsing over import.meta.env and stays that way: the store
  // is the only thing that talks to the backend, so it is the only thing that
  // needs to know where it is.
  store: ['@reduxjs/toolkit', 'async-mutex', 'react-redux'],
  // storehooks unwraps the response envelope in plain TypeScript rather than
  // with a decoder, which is what keeps io-ts inside validation. It uses no
  // package at all: the hooks it builds its interfaces out of are given to
  // it, so even react arrives as somebody else's function.
  storehooks: [],
  validation: ['fp-ts', 'io-ts'],
  // wiring is the composition root: it builds the *If interfaces out of the
  // storehooks, hands each of them the validators it needs, declares which
  // component answers which path and installs the store and the router around
  // the tree. It is the one layer that may import every other one, so it is
  // also the one that must never be imported back. It names exported
  // functions and passes them on: behaviour written here as a lambda would
  // only run deep inside the application, where the tests that construct the
  // tree cannot see it.
  wiring: ['react', 'react-router'],
}

// Files directly under src are the entry point alone: index.tsx renders
// wiring/Root into the document and reports the web vitals. Composition itself
// lives in wiring/, so react and react-router are not needed here. index.tsx
// does render JSX, which reaches react through the automatic runtime the
// transform injects rather than through an import, so the ban below never sees
// it: the list governs what the source asks for, and the source asks for the
// renderer only.
const rootDependencies = ['react-dom', 'web-vitals']

// What a unit test may import on top of what its layer may import. The tests
// live next to the code, so they match the layer configs and would otherwise
// inherit a ban on their own tooling. They get no extra layers: a test that
// needs a layer its subject may not import is describing an architecture
// violation, not a testing need.
const testDependencies = [
  '@testing-library/react',
  '@testing-library/user-event',
  'vitest',
]

// The test utilities and the end-to-end tests get their own rule sets rather
// than sharing the ones of src. They are not production code and they are not
// the unit tests either, so the two are free to diverge from src and from each
// other without anyone having to untangle a shared object first. They start
// from the same rules on purpose: what is not needed here is not relaxed here.
const testUtilRules = {
  ...rules,
}

const e2eRules = {
  ...rules,
}

// test-util exists to serve src and reaches into it freely, internals
// included: it is not a layer, so the layer bans do not apply to it, and the
// test server reads the port it listens on from store/internal/config/. e2e
// does not: it drives the built application over HTTP and has no business
// reaching into either one.
const testUtilDependencies = [
  '@testing-library/react',
  '@testing-library/user-event',
  'http',
  'net',
  'react',
  'vitest',
]
const e2eDependencies = ['@playwright/test', 'uuid']

// A layer that is never registered above would otherwise get no restrictions
// at all and be importable from everywhere, which is the one way the
// derivation could quietly become too permissive. Fail the lint instead of
// allowing that.
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
      'Every directory under src is a layer and must be listed in layers of ' +
      'eslint.config.mjs so that import restrictions are applied to and ' +
      'against it.',
  )
}

// The same argument for the two maps: a missing entry is a layer without a
// restriction, and an unknown name in layerImports is a typo that silently
// widens an allow list, because a layer that is not banned is allowed.
const layersWithoutDependencies = layers.filter(
  (layer) => layerDependencies[layer] === undefined,
)
if (layersWithoutDependencies.length > 0) {
  throw new Error(
    'Layers without a dependency list: ' +
      `${layersWithoutDependencies.join(', ')}. Every layer must be listed ` +
      'in layerDependencies of eslint.config.mjs, with an empty array when ' +
      'it uses no external packages, so that unlisted packages stay banned ' +
      'from it.',
  )
}

const layersWithoutImports = layers.filter(
  (layer) => layerImports[layer] === undefined,
)
if (layersWithoutImports.length > 0) {
  throw new Error(
    `Layers without an import list: ${layersWithoutImports.join(', ')}. ` +
      'Every layer must be listed in layerImports of eslint.config.mjs, with ' +
      'an empty array when it imports no other layer, so that unlisted ' +
      'layers stay banned from it.',
  )
}

const unknownImports = layers.flatMap((layer) =>
  (layerImports[layer] ?? []).filter((imported) => !layers.includes(imported)),
)
if (unknownImports.length > 0) {
  throw new Error(
    `Unknown layers in layerImports: ${unknownImports.join(', ')}. A name ` +
      'that is not a layer bans nothing and therefore allows everything it ' +
      'was meant to name.',
  )
}

function layerFiles(layer) {
  return [`src/${layer}/*.{ts,tsx}`, `src/${layer}/**/*.{ts,tsx}`]
}

function layerTestFiles(layer) {
  return [`src/${layer}/*.test.{ts,tsx}`, `src/${layer}/**/*.test.{ts,tsx}`]
}

// renderHook is a wrapper around render with a test component of the
// library's own making, and the library itself says to prefer render: a test
// that renders a component reads as the thing being tested instead of hiding
// it behind an abstraction. Writing the component out is the point, not the
// boilerplate.
const restrictedTestingLibraryImports = [
  {
    name: '@testing-library/react',
    importNames: ['renderHook'],
    message:
      'Render a component that uses the hook instead. See ' +
      'https://testing-library.com/docs/react-testing-library/api/#renderhook',
  },
]

function restrictedImports(patterns) {
  return {
    'no-restricted-imports': [
      'error',
      { paths: restrictedTestingLibraryImports, patterns },
    ],
  }
}

// Anchored at a path segment so that a file whose name merely ends in a layer
// name, such as components/internal/stats/filter-types, is not mistaken for
// the layer itself.
function directoryPattern(directory, message) {
  return {
    regex: `(?:^|/)${directory}/`,
    message,
  }
}

// Every layer the given layer was not given in layerImports. Bans are listed
// rather than allowances because an import that matches no pattern is allowed,
// so the list has to name what is forbidden.
function disallowedLayerPatterns(layer) {
  const allowed = layerImports[layer] ?? []
  return layers
    .filter((other) => other !== layer && !allowed.includes(other))
    .map((other) =>
      directoryPattern(
        other,
        `${layer}/ may not import ${other}/. Add it to layerImports of ` +
          'eslint.config.mjs if the dependency belongs in the architecture.',
      ),
    )
}

// A layer with internals is used through its public modules only. The layer
// itself is left out: reaching into its own internals is what they are for.
function internalPatterns(layer) {
  return layersWithInternals
    .filter((other) => other !== layer)
    .map((other) => ({
      regex: `(?:^|/)${other}/internal/`,
      message: `Use ${other}/ through its public modules.`,
    }))
}

// Test scaffolding belongs to the tests. Production code that imports it ships
// it.
const testUtilPattern = directoryPattern(
  'test-util',
  'test-util/ is for tests only.',
)

function escapeForRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Bans every non-relative import, which is every package and every node
// builtin, except the listed ones and their subpaths. An empty list therefore
// bans all external imports.
function dependencyPattern(name, dependencies) {
  const allowed = dependencies
    .map((dependency) => `${escapeForRegex(dependency)}(?:/|$)`)
    .join('|')
  const exceptAllowed = allowed.length === 0 ? '' : `(?!(?:${allowed}))`
  const allowedList =
    dependencies.length === 0
      ? 'no external packages'
      : `only ${dependencies.join(', ')}`
  return {
    regex: `^(?!\\.)${exceptAllowed}`,
    message:
      `${name} may import ${allowedList}. Add the package to ` +
      'eslint.config.mjs if it belongs here, and otherwise use the layer ' +
      'that owns it.',
  }
}

// The production files of a layer, and then its tests, which are the same
// layers plus the testing tools. The test entry has to repeat the layer
// patterns because flat config merges rule by rule: the entry that comes later
// replaces the whole no-restricted-imports value, not part of it.
const layerConfigs = layers.flatMap((layer) => [
  {
    languageOptions,
    plugins,
    files: layerFiles(layer),
    rules: {
      ...rules,
      ...restrictedImports([
        ...disallowedLayerPatterns(layer),
        ...internalPatterns(layer),
        testUtilPattern,
        dependencyPattern(`${layer}/`, layerDependencies[layer]),
      ]),
    },
  },
  {
    languageOptions,
    plugins,
    files: layerTestFiles(layer),
    rules: {
      ...rules,
      ...restrictedImports([
        ...disallowedLayerPatterns(layer),
        ...internalPatterns(layer),
        dependencyPattern(`The tests of ${layer}/`, [
          ...layerDependencies[layer],
          ...testDependencies,
        ]),
      ]),
    },
  },
])

export default [
  {
    languageOptions,
    files: ['src/*.{js,ts,tsx,jsx}', 'src/**/*.{js,ts,tsx,jsx}'],
    plugins,
    rules,
  },
  ...layerConfigs,
  // The files directly under src are the entry point. They may reach into any
  // layer, which in practice means wiring/, and are restricted on their
  // packages only.
  {
    languageOptions,
    plugins,
    files: ['src/*.{ts,tsx}'],
    rules: {
      ...rules,
      ...restrictedImports([
        testUtilPattern,
        dependencyPattern('Files directly under src/', rootDependencies),
      ]),
    },
  },
  {
    languageOptions,
    plugins,
    files: ['src/*.test.{ts,tsx}'],
    rules: {
      ...rules,
      ...restrictedImports([
        dependencyPattern('The tests directly under src/', [
          ...rootDependencies,
          ...testDependencies,
        ]),
      ]),
    },
  },
  {
    languageOptions,
    files: ['src/*.test.{js,ts,tsx,jsx}', 'src/**/*.test.{js,ts,tsx,jsx}'],
    plugins,
    rules: {
      ...rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/strict-void-return': 'off',
    },
  },
  {
    languageOptions,
    files: ['test-util/*.{ts,tsx}', 'test-util/**/*.{ts,tsx}'],
    plugins,
    rules: {
      ...testUtilRules,
      ...restrictedImports([
        dependencyPattern('test-util/', testUtilDependencies),
      ]),
    },
  },
  {
    languageOptions,
    files: ['e2e/*.ts', 'e2e/**/*.ts'],
    plugins,
    rules: {
      ...e2eRules,
      ...restrictedImports([
        directoryPattern(
          'src',
          'e2e/ drives the built application and may not import its code.',
        ),
        testUtilPattern,
        dependencyPattern('e2e/', e2eDependencies),
      ]),
    },
  },
  {
    // Generated output. coverage/ is the one that bites: the html report
    // writes its scripts with an eslint-disable header, which lints as an
    // unused directive and fails the zero-warning lint after every coverage
    // run.
    ignores: [
      '*.css',
      '*.svg',
      '*.json',
      'vite.config.ts',
      'vitest.config.ts',
      'coverage/**',
      'dist/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
]
