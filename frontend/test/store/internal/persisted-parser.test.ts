import { test } from '../../test'
import { assertDeepEqual } from '../../assert'
import { parsePersisted } from '../../../src/store/internal/persisted-parser'

const initial = {
  navMenu: { state: 'COLLAPSED' },
  theme: { theme: 'LIGHT' },
} as const

test('parse settings', () => {
  const settings = {
    navMenu: { state: 'EXPANDED' },
    theme: { theme: 'DARK' },
  } as const
  assertDeepEqual(parsePersisted(JSON.stringify(settings)), settings)
})

test('start from the initial settings when nothing is stored', () => {
  assertDeepEqual(parsePersisted(null), initial)
})

test('start from the initial settings when what is stored is not JSON', () => {
  assertDeepEqual(parsePersisted('{"navMenu":'), initial)
})

test('start from the initial settings when what is stored is null', () => {
  assertDeepEqual(parsePersisted('null'), initial)
})

test('start from the initial settings when what is stored is no object', () => {
  assertDeepEqual(parsePersisted('"DARK"'), initial)
})

test('leave a setting that is missing at its initial value', () => {
  assertDeepEqual(
    parsePersisted(JSON.stringify({ theme: { theme: 'DARK' } })),
    { navMenu: { state: 'COLLAPSED' }, theme: { theme: 'DARK' } },
  )
})

test('leave a setting that is not an object at its initial value', () => {
  assertDeepEqual(
    parsePersisted(JSON.stringify({ navMenu: 'EXPANDED', theme: 'DARK' })),
    initial,
  )
})

test('leave a setting with an unknown value at its initial value', () => {
  assertDeepEqual(
    parsePersisted(
      JSON.stringify({
        navMenu: { state: 'EXPANDED' },
        theme: { theme: 'SEPIA' },
      }),
    ),
    { navMenu: { state: 'EXPANDED' }, theme: { theme: 'LIGHT' } },
  )
})

test('leave a setting of the wrong type at its initial value', () => {
  assertDeepEqual(
    parsePersisted(
      JSON.stringify({ navMenu: { state: true }, theme: { theme: 1 } }),
    ),
    initial,
  )
})

test('parse only the settings', () => {
  // A key written before the session moved out of it still has a login.
  assertDeepEqual(
    parsePersisted(
      JSON.stringify({
        login: { login: { authToken: 'auth' } },
        navMenu: { state: 'EXPANDED', extra: 'extra' },
        theme: { theme: 'DARK' },
      }),
    ),
    { navMenu: { state: 'EXPANDED' }, theme: { theme: 'DARK' } },
  )
})
