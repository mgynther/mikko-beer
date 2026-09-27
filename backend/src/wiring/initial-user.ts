import { v4 as uuidv4 } from 'uuid'

import type { Config } from './config.js'
import type { log } from '../console/log.js'
import type { Database } from '../data/database.js'
import * as userRepository from '../data/user/user.repository.js'
import type { CreateAnonymousUserRequest, User } from '../logic/user/user.js'
import type { AuthTokenConfig } from '../logic/auth/auth-token.js'
import {
  createInitialUser,
  addPasswordForInitialUser,
} from '../logic/app-initial-user.js'
import { createAddPasswordUserIf } from './user/sign-in-method/sign-in-method-helper.js'
import { jwtIf } from './authentication/jwt-helper.js'

export interface StartResult {
  authToken: string
  userId: string
}

export async function createInitialUserIfNone(
  db: Database,
  config: Config,
  log: log,
): Promise<StartResult> {
  const startResult: StartResult = {
    authToken: '',
    userId: '',
  }
  const users = await userRepository.listUsers(db)
  if (users.length > 0) {
    return startResult
  }
  const isAdminPasswordNeeded = config.generateInitialAdminPassword
  function logWithAdminPassword(...args: string[]): void {
    if (isAdminPasswordNeeded) {
      log('INFO', ...args)
    }
  }
  logWithAdminPassword('No users. Creating initial admin')
  const adminUsername = uuidv4()
  const adminPassword = uuidv4()
  await db.executeReadWriteTransaction(async (trx): Promise<void> => {
    const authTokenConfig: AuthTokenConfig = {
      secret: config.authTokenSecret,
      expiryDurationMin: config.authTokenExpiryDurationMin,
    }
    const user = await createInitialUser(
      jwtIf,
      async (request: CreateAnonymousUserRequest): Promise<User> =>
        await userRepository.createAnonymousUser(trx, request),
      authTokenConfig,
      uuidv4(),
      log,
    )
    startResult.authToken = user.authToken.authToken
    startResult.userId = user.user.id
    if (isAdminPasswordNeeded) {
      const addPasswordUserIf = createAddPasswordUserIf(
        trx,
        config.passwordHashParameters,
      )
      await addPasswordForInitialUser(
        addPasswordUserIf,
        user.user.id,
        {
          username: adminUsername,
          password: adminPassword,
        },
        log,
      )
    }
  })
  logWithAdminPassword(
    `Created initial user "${adminUsername}" with password "${
      adminPassword
    }". Please change the password a.s.a.p.`,
  )
  return startResult
}
