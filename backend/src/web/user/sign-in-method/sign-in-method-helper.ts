import * as signInMethodService from '../../../core/user/sign-in-method.service'
import * as userService from '../../../core/user/user.service'

import * as signInMethodRepository from '../../../data/user/sign-in-method/sign-in-method.repository'
import * as userRepository from '../../../data/user/user.repository'

import type { Transaction } from "../../../data/database"
import { log } from '../../../core/log'
import {
  type UserPasswordHash,
  validatePasswordSignInMethod
} from "../../../core/user/sign-in-method"
import type { AddPasswordUserIf } from "../../../core/user/sign-in-method.service"

export async function addPasswordSignInMethod (
  trx: Transaction,
  userId: string,
  request: unknown,
  log: log
): Promise<string> {
  const passwordSignInMethod = validatePasswordSignInMethod(request)

  const addPasswordUserIf: AddPasswordUserIf = {
    lockUserById: createLockUserById(trx),
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
      return userService.setUserUsername(
        (userId: string, username: string) => {
          return userRepository.setUserUsername(trx, userId, username)
      }, userId, username, log)
    }
  }
  await signInMethodService.addPasswordSignInMethod(
    addPasswordUserIf,
    userId,
    passwordSignInMethod
  )
  return passwordSignInMethod.username
}

export function createLockUserById(trx: Transaction) {
  return function(userId: string): Promise<any> {
    return userService.lockUserById((userId: string) => {
      return userRepository.lockUserById(trx, userId)
    }, userId)
  }
}
