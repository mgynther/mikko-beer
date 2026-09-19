export interface Refresh {
  authToken: string
  refreshToken: string
}

// The token refresh happens inside the base query, triggered by any 401, so
// there is no storehook in the path and no validation layer to call. This is
// not validation: it is the store refusing to store rubbish about itself, the
// same job refresh-details-parser does on the way out.
export function parseRefresh(data: unknown): Refresh | undefined {
  if (data === null || typeof data !== 'object') {
    return undefined
  }
  if (!('authToken' in data) || !('refreshToken' in data)) {
    return undefined
  }
  const { authToken, refreshToken } = data
  if (typeof authToken !== 'string' || authToken.length === 0) {
    return undefined
  }
  if (typeof refreshToken !== 'string' || refreshToken.length === 0) {
    return undefined
  }
  return { authToken, refreshToken }
}
