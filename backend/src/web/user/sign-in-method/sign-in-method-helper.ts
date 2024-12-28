import * as signInMethodService from '../../../core/user/sign-in-method.service'

import * as signInMethodRepository from '../../../data/user/sign-in-method/sign-in-method.repository'
import * as userRepository from '../../../data/user/user.repository'

import type { Transaction } from "../../../data/database"
import { log } from '../../../core/log'
import type { UserPasswordHash } from "../../../core/user/sign-in-method"
import { validatePasswordSignInMethod } from "../../../core/user/sign-in-method"
import type { AddPasswordUserIf } from "../../../core/user/sign-in-method.service"

export async function addPasswordSignInMethod (
  trx: Transaction,
  userId: string,
  request: unknown,
  log: log
): Promise<string> {
  const passwordSignInMethod = validatePasswordSignInMethod(request)

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
  await signInMethodService.addPasswordSignInMethod(
    addPasswordUserIf,
    userId,
    passwordSignInMethod,
    log
  )
  return passwordSignInMethod.username
}
