import type { NavMenuExpandedState, NavMenuState } from './nav-menu/reducer'
import { initialState as initialNavMenuState } from './nav-menu/reducer'
import type { Theme } from './theme/reducer'
import { initialState as initialThemeState } from './theme/reducer'

interface Persisted {
  navMenu: NavMenuState
  theme: { theme: Theme }
}

// The settings are read from localStorage, where anything at all may be
// sitting. Each member is taken only if it is one of the values the state
// can hold and left at its initial value otherwise, so a hand edited or
// outdated key costs at most the setting it got wrong.
export function parsePersisted(stored: string | null): Persisted {
  const value: unknown = parseJson(stored)
  return {
    navMenu: {
      state: parseNavMenuState(memberOf(memberOf(value, 'navMenu'), 'state')),
    },
    theme: {
      theme: parseTheme(memberOf(memberOf(value, 'theme'), 'theme')),
    },
  }
}

function parseJson(stored: string | null): unknown {
  if (stored === null) {
    return undefined
  }
  try {
    return JSON.parse(stored)
  } catch {
    return undefined
  }
}

function memberOf(value: unknown, name: string): unknown {
  if (value === null || typeof value !== 'object') {
    return undefined
  }
  const member: unknown = Reflect.get(value, name)
  return member
}

function parseNavMenuState(value: unknown): NavMenuExpandedState {
  if (value === 'COLLAPSED' || value === 'EXPANDED') {
    return value
  }
  return initialNavMenuState.state
}

function parseTheme(value: unknown): Theme {
  if (value === 'LIGHT' || value === 'DARK') {
    return value
  }
  return initialThemeState.theme
}
