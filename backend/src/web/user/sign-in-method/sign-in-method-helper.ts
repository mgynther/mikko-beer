import * as signInMethodRepository
from '../../../data/user/sign-in-method/sign-in-method.repository'
import * as userRepository from '../../../data/user/user.repository'

import type { Transaction } from "../../../data/database"
import type {
  AddPasswordUserIf,
  UserPasswordHash
} from "../../../core/user/sign-in-method"

export function createAddPasswordUserIf (trx: Transaction): AddPasswordUserIf {
  const addPasswordUserIf: AddPasswordUserIf = {
    lockUserById: async (userId: string) =>
      await userRepository.lockUserById(trx, userId),
    insertPasswordSignInMethod: async function(
      userPassword: UserPasswordHash
    ): Promise<void> {
      await signInMethodRepository.insertPasswordSignInMethod(
        trx, userPassword
      )
    },
    setUserUsername: async function(
      userId: string, username: string
    ): Promise<void> {
      await userRepository.setUserUsername(trx, userId, username);
    }
  }
  return addPasswordUserIf
}
