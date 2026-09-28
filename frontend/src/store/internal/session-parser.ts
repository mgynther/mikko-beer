interface SessionUser {
  id: string
  username: string
  role: string
}

// The user the tokens belong to and the tokens themselves, kept together
// because a refresh is made for a user id and has to send that user's token.
export interface Session {
  authToken: string
  refreshToken: string
  user: SessionUser
}

// The session is read from localStorage, where anything at all may be
// sitting, including something another tab or a hand edit left half written.
// What is not a whole session is no session, which the application shows as
// logged out. This is not validation: it is the store refusing to trust what
// it wrote about itself, the same job refresh-parser does for a refresh.
export function parseSession(stored: string | null): Session | undefined {
  if (stored === null) {
    return undefined
  }
  let value: unknown
  try {
    value = JSON.parse(stored)
  } catch {
    return undefined
  }
  if (value === null || typeof value !== 'object') {
    return undefined
  }
  if (
    !('authToken' in value) ||
    !('refreshToken' in value) ||
    !('user' in value)
  ) {
    return undefined
  }
  const { authToken, refreshToken } = value
  if (typeof authToken !== 'string' || authToken.length === 0) {
    return undefined
  }
  if (typeof refreshToken !== 'string' || refreshToken.length === 0) {
    return undefined
  }
  const user = parseUser(value.user)
  if (user === undefined) {
    return undefined
  }
  return { authToken, refreshToken, user }
}

function parseUser(value: unknown): SessionUser | undefined {
  if (value === null || typeof value !== 'object') {
    return undefined
  }
  if (!('id' in value) || !('username' in value) || !('role' in value)) {
    return undefined
  }
  const { id, username, role } = value
  if (
    typeof id !== 'string' ||
    typeof username !== 'string' ||
    typeof role !== 'string'
  ) {
    return undefined
  }
  return { id, username, role }
}
