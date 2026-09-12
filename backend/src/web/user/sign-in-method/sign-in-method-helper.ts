import * as signInMethodRepository from '../../../data/user/sign-in-method/sign-in-method.repository.js'
import * as userRepository from '../../../data/user/user.repository.js'

import type {
  AddPasswordUserIf,
  UserPasswordHash,
} from '../../../logic/user/sign-in-method'
import type { User } from '../../../logic/user/user.js'
import type { Transaction } from '../../../data/database'
import { encryptSecret, verifySecret } from '../../../crypto/crypto.service.js'
import type { log } from '../../../console/log.js'

export function createErrorLogger(logger: log): (...args: string[]) => void {
  return (...args: string[]): void => {
    logger('ERROR', ...args)
  }
}

function wrapEncryptSecret(logger: log, secret: string): Promise<string> {
  return encryptSecret(createErrorLogger(logger), secret)
}

export const createEncryptSecret =
  () =>
  (logger: log, secret: string): Promise<string> =>
    wrapEncryptSecret(logger, secret)

function wrapVerifySecret(
  logger: log,
  secret: string,
  hash: string,
): Promise<boolean> {
  return verifySecret(createErrorLogger(logger), secret, hash)
}

export const createVerifySecret =
  () =>
  (logger: log, secret: string, hash: string): Promise<boolean> =>
    wrapVerifySecret(logger, secret, hash)

export function createAddPasswordUserIf(trx: Transaction): AddPasswordUserIf {
  const addPasswordUserIf: AddPasswordUserIf = {
    lockUserById: async (userId: string): Promise<User | undefined> =>
      await userRepository.lockUserById(trx, userId),
    insertPasswordSignInMethod: async function (
      userPassword: UserPasswordHash,
    ): Promise<void> {
      await signInMethodRepository.insertPasswordSignInMethod(trx, userPassword)
    },
    setUserUsername: async function (
      userId: string,
      username: string,
    ): Promise<void> {
      await userRepository.setUserUsername(trx, userId, username)
    },
    encryptSecret: createEncryptSecret(),
  }
  return addPasswordUserIf
}
