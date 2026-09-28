import type { Session } from './session-parser'

// Another tab may refresh the session or end it while a request of this tab
// is on its way, so after each failure the tab compares what it sent with the
// session stored now, and only a session nobody has moved on from is refreshed
// or ended.

export type AfterUnauthorized =
  | { next: 'logout' }
  | { next: 'retry'; session: Session }
  | { next: 'refresh'; session: Session }

export type AfterFailedRefresh =
  { next: 'logout' } | { next: 'retry'; session: Session }

export function afterUnauthorized(
  sentAuthToken: string,
  stored: Session | undefined,
): AfterUnauthorized {
  if (stored === undefined) {
    return { next: 'logout' }
  }
  if (stored.authToken !== sentAuthToken) {
    return { next: 'retry', session: stored }
  }
  return { next: 'refresh', session: stored }
}

export function afterFailedRefresh(
  sentRefreshToken: string,
  stored: Session | undefined,
): AfterFailedRefresh {
  if (stored === undefined) {
    return { next: 'logout' }
  }
  if (stored.refreshToken !== sentRefreshToken) {
    return { next: 'retry', session: stored }
  }
  return { next: 'logout' }
}
