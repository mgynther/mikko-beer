import { parseSession } from './session-parser'
import type { Session } from './session-parser'

// The session lives in localStorage and nowhere else, and is read whenever it
// is needed. Every tab shares it, so a tab never holds a copy that another
// tab's refresh has made stale, and never writes such a copy back.
const sessionKey = 'mikkobeer-session'

export function readSession(): Session | undefined {
  return parseSession(localStorage.getItem(sessionKey))
}

export function writeSession(session: Session): void {
  localStorage.setItem(
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

export function clearSession(): void {
  localStorage.removeItem(sessionKey)
}
