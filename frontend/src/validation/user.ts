import * as t from 'io-ts'
import { isLeft } from 'fp-ts/Either'

import type { User, UserList } from '../core/user/types'
import { formatError } from './format-error'

const ValidatedUser = t.type({
  id: t.string,
  username: t.string,
  role: t.string
})

const ValidatedUserList = t.type({
  users: t.array(ValidatedUser)
})

export function validateUserOrUndefined(result: unknown): User | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  type UserT = t.TypeOf<typeof ValidatedUser>
  const decoded = ValidatedUser.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: UserT = decoded.right
  return valid
}

export function validateUserListOrUndefined(
  result: unknown
): UserList | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateUserList(result)
}

function validateUserList(result: unknown): UserList {
  type UserListT = t.TypeOf<typeof ValidatedUserList>
  const decoded = ValidatedUserList.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: UserListT = decoded.right
  return valid
}
