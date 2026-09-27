import * as signInMethodRepository from '../../../data/user/sign-in-method/sign-in-method.repository.js'
import * as userRepository from '../../../data/user/user.repository.js'

import type {
  AddPasswordUserIf,
  UserPasswordHash,
} from '../../../logic/user/sign-in-method'
import type { User } from '../../../logic/user/user.js'
import type { Transaction } from '../../../data/database'
import {
  encryptSecret,
  needsRehash,
  rejectSecret,
  verifySecret,
} from '../../../crypto/crypto.service.js'
import type { ScryptParameters } from '../../../crypto/scrypt-parameters.js'
import type { log } from '../../../console/log.js'
import { createCryptoErrorLogger } from '../../crypto-error-logger.js'

function wrapEncryptSecret(
  logger: log,
  parameters: ScryptParameters,
  secret: string,
): Promise<string> {
  return encryptSecret(createCryptoErrorLogger(logger), parameters, secret)
}

export const createEncryptSecret =
  (parameters: ScryptParameters) =>
  (logger: log, secret: string): Promise<string> =>
    wrapEncryptSecret(logger, parameters, secret)

function wrapVerifySecret(
  logger: log,
  secret: string,
  hash: string,
): Promise<boolean> {
  return verifySecret(createCryptoErrorLogger(logger), secret, hash)
}

export const createVerifySecret =
  () =>
  (logger: log, secret: string, hash: string): Promise<boolean> =>
    wrapVerifySecret(logger, secret, hash)

function wrapRejectSecret(
  logger: log,
  parameters: ScryptParameters,
  secret: string,
): Promise<void> {
  return rejectSecret(createCryptoErrorLogger(logger), parameters, secret)
}

export const createRejectSecret =
  (parameters: ScryptParameters) =>
  (logger: log, secret: string): Promise<void> =>
    wrapRejectSecret(logger, parameters, secret)

export const createNeedsRehash =
  (parameters: ScryptParameters) =>
  (hash: string): boolean =>
    needsRehash(parameters, hash)

export function createAddPasswordUserIf(
  trx: Transaction,
  passwordHashParameters: ScryptParameters,
): AddPasswordUserIf {
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
    encryptSecret: createEncryptSecret(passwordHashParameters),
  }
  return addPasswordUserIf
}
