import { signJwt, verifyJwt } from '../../jwt/jwt.service.js'

import type { JwtIf } from '../../logic/auth/auth-token.js'

// The single place where the jwt layer implementation is bound to the JwtIf
// the logic layer declares.
export const jwtIf: JwtIf = {
  sign: signJwt,
  verify: verifyJwt,
}
