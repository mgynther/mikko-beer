import * as t from 'io-ts'
import { isLeft } from 'fp-ts/Either'

import { formatError } from './format-error'
import type { User } from './user'
import { ValidatedUser, toUser } from './user'

// This layer's own views of a valid login, declared here rather than imported
// from types/. See the comment in style.ts.

// What signing in answers. Its tokens are for the store alone.
export interface Login {
  authToken: string
  refreshToken: string
  user: User
}

// What the store gives back of the login it keeps: the user alone, and no
// user when nobody is logged in.
export interface StoredLogin {
  user: User | undefined
}

const ValidatedLogin = t.type({
  authToken: t.string,
  refreshToken: t.string,
  user: ValidatedUser,
})

const ValidatedStoredLogin = t.type({
  user: t.union([ValidatedUser, t.undefined]),
})

function toLogin(login: t.TypeOf<typeof ValidatedLogin>): Login {
  return {
    authToken: login.authToken,
    refreshToken: login.refreshToken,
    user: toUser(login.user),
  }
}

// A user missing from the stored login is an explicit undefined from here on,
// so that no layer can forget to pass it along.
function toStoredLogin(
  login: t.TypeOf<typeof ValidatedStoredLogin>,
): StoredLogin {
  return {
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

export function validateStoredLogin(result: unknown): StoredLogin {
  const decoded = ValidatedStoredLogin.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return toStoredLogin(decoded.right)
}
