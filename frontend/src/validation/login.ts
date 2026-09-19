import * as t from 'io-ts'
import { isLeft } from 'fp-ts/Either'

import { formatError } from './format-error'
import type { User } from './user'
import { ValidatedUser, toUser } from './user'

// This layer's own view of a valid login, declared here rather than imported
// from types/. See the comment in style.ts.
export interface Login {
  authToken: string
  refreshToken: string
  user: User | undefined
}

const ValidatedLogin = t.type({
  authToken: t.string,
  refreshToken: t.string,
  user: t.union([ValidatedUser, t.undefined]),
})

// A user missing from the response is an explicit undefined from here on, so
// that no layer can forget to pass it along.
function toLogin(login: t.TypeOf<typeof ValidatedLogin>): Login {
  return {
    authToken: login.authToken,
    refreshToken: login.refreshToken,
    user: login.user === undefined ? undefined : toUser(login.user),
  }
}

export function validateLogin(result: unknown): Login {
  const decoded = ValidatedLogin.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return toLogin(decoded.right)
}
