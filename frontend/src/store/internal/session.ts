import type { WebStorage } from '../web-storage'
import { parseSession } from './session-parser'
import type { Session } from './session-parser'

// The session lives in the store's storage and nowhere else, and is read
// whenever it is needed. In the application that storage is localStorage,
// which every tab shares, so a tab never holds a copy that another tab's
// refresh has made stale, and never writes such a copy back.
const sessionKey = 'mikkobeer-session'

export function readSession(storage: WebStorage): Session | undefined {
  return parseSession(storage.getItem(sessionKey))
}

export function writeSession(storage: WebStorage, session: Session): void {
  storage.setItem(
    sessionKey,
    JSON.stringify({
      authToken: session.authToken,
      refreshToken: session.refreshToken,
      user: {
        id: session.user.id,
        username: session.user.username,
        role: session.user.role,
      },
    }),
  )
}

export function clearSession(storage: WebStorage): void {
  storage.removeItem(sessionKey)
}
