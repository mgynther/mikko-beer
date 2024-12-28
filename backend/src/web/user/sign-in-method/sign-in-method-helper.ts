import * as signInMethodRepository from '../../../data/user/sign-in-method/sign-in-method.repository'
import * as userRepository from '../../../data/user/user.repository'

import type { Transaction } from "../../../data/database"
import type {
  AddPasswordUserIf,
  UserPasswordHash
} from "../../../core/user/sign-in-method"

export function createAddPasswordUserIf (trx: Transaction): AddPasswordUserIf {
  const addPasswordUserIf: AddPasswordUserIf = {
    lockUserById: (userId: string) => userRepository.lockUserById(trx, userId),
    insertPasswordSignInMethod: function(
      userPassword: UserPasswordHash
    ): Promise<void> {
      return signInMethodRepository.insertPasswordSignInMethod(
        trx, userPassword
      ) as Promise<unknown> as Promise<void>
    },
    setUserUsername: function(
      userId: string, username: string
    ): Promise<void> {
      return userRepository.setUserUsername(trx, userId, username)
    }
  }
  return addPasswordUserIf
}
