import type { Config } from '../config.js'
import { jwtIf } from './jwt-helper.js'

import { parseAuthTokenPayload } from '../../logic/auth/authentication.js'
import type { AuthTokenPayload } from '../../logic/auth/auth-token.js'
import type { AuthorizedRequest } from '../../web/request.js'

// The auth token is parsed before handle runs, and handle cannot get a
// payload any other way, so a request without a valid token never reaches
// a transaction.
export function authenticated<Request extends AuthorizedRequest, Body>(
  config: Config,
  handle: (
    authTokenPayload: AuthTokenPayload,
    request: Request,
  ) => Promise<Body>,
): (request: Request) => Promise<Body> {
  return async (request: Request): Promise<Body> => {
    const authTokenPayload = parseAuthTokenPayload(
      jwtIf,
      request.authorization,
      config.authTokenSecret,
    )
    return await handle(authTokenPayload, request)
  }
}
