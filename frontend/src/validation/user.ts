import * as t from 'io-ts'
import { isLeft } from 'fp-ts/Either'

import { formatError } from './format-error'

// This layer's own view of a valid user, declared here rather than imported
// from types/. See the comment in style.ts. The role arrives as a string and
// is kept as one: which strings are roles is the application's business, not
// the response's.
export interface User {
  id: string
  username: string
  role: string
}

export interface UserList {
  users: User[]
}

export const ValidatedUser = t.type({
  id: t.string,
  username: t.string,
  role: t.string,
})

const ValidatedUserList = t.type({
  users: t.array(ValidatedUser),
})

export function toUser(user: t.TypeOf<typeof ValidatedUser>): User {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
  }
}

export function validateUserOrUndefined(result: unknown): User | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  const decoded = ValidatedUser.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return toUser(decoded.right)
}

export function validateUserListOrUndefined(
  result: unknown,
): UserList | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateUserList(result)
}

function validateUserList(result: unknown): UserList {
  const decoded = ValidatedUserList.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return {
    users: decoded.right.users.map(toUser),
  }
}
