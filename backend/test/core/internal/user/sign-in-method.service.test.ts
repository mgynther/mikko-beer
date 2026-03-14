import { describe, it } from 'node:test'
import {
  assertDeepEqual,
  assertEqual,
  assertGreaterThan
} from '../../../assert'

import * as authTokenService from '../../../../src/core/internal/auth/auth-token.service'

import {
  addPasswordSignInMethod,
  changePassword,
  encryptPassword,
  signInUsingPassword,
  verifySecret
} from '../../../../src/core/internal/user/sign-in-method.service'

import type {
  AddPasswordUserIf,
  ChangePasswordUserIf,
  PasswordChange,
  PasswordSignInMethod,
  SignInUsingPasswordIf,
  NewUserPasswordHash,
  UserPasswordHash,
} from '../../../../src/core/user/sign-in-method'
import type { User } from '../../../../src/core/user/user'
import {
  invalidCredentialsError,
  passwordTooLongError,
  passwordTooWeakError,
  userAlreadyHasSignInMethodError
} from '../../../../src/core/errors'
import { expectReject } from '../../controller-error-helper'
import { dummyLog as log } from '../../dummy-log'
import type { AuthTokenConfig } from '../../../../src/core/auth/auth-token'

function assertCurrentDateTime(date: Date) {
  if (date === undefined) {
    throw new Error('date is undefined')
  }
  const currentDate = new Date()
  // If any more precision is needed it would be better to inverse date access.
  // Without any time related logic in the implementation sanity checking the
  // dates is fine.
  assertGreaterThan(60 * 1000, Math.abs(currentDate.getTime() - date.getTime()))
}

describe('encrypt and verify password', () => {
  it('fail to encrypt too short password', async () => {
    expectReject(async () => {
      await encryptPassword('passwor')
    }, passwordTooWeakError)
  })

  it('fail to encrypt too long password', async () => {
    expectReject(async () => {
      await encryptPassword('password'.repeat(100))
    }, passwordTooLongError)
  })

  it('encrypt password and verify password', async () => {
    const password = 'password'
    const result = await encryptPassword(password)
    // Sanity check format without being specific.
    assertGreaterThan(result.length, 30)
    const [salt, hashedPassword] = result.split(':')
    assertGreaterThan(salt.length, 10)
    assertGreaterThan(hashedPassword.length, 20)
    // There's no trivial way ensure hash is correct without using the same
    // implementation as in the tested code.
    assertEqual(await verifySecret(password, result), true)
    // While ensuring correctness is hard, it's trivial to ensure wrong
    // password fails.
    assertEqual(await verifySecret(`${password}1`, result), false)
  })
})

describe('password sign-in-method service unit tests', () => {
  const userId = '3b3adde6-c6a2-45f1-bd5e-bce71b8d835f'
  const username = 'user'
  const user: User = {
    id: userId,
    role: 'admin',
    username: username
  }

  const noPasswordUser: User = {
    id: userId,
    role: 'admin',
    username: null,
  }

  const knownPassword = 'password'
  const knownHash = '3571471e876241089e4e29130fd96cf0:6b26a82522532fca44ba7fef2f6b6f5d930fb2e2179f7cdcd682470d15a4cc4296b7f77c59bf317fa7281900626cf7b4499948d9d0f4718ae1170d4a63e35f36'

  const otherPassword = 'password1'
  const otherHash = 'c4e457548452abcaf38f97cfce412926:8af0071d2da359277beea4a9c3232d898b975e9ed9170bdea77578667f753f08970144297a5cd9382acbcb9a5341f3e0e0026c1c7d877dcfbce2abd3f528bb9f'

  const hashDate = new Date('2023-03-04T12:12:12.222Z')

  const method: PasswordSignInMethod = {
    username,
    password: knownPassword,
  }

  const passwordChange: PasswordChange = {
    oldPassword: method.password,
    newPassword: otherPassword,
  }

  const recentUserPasswordHash: UserPasswordHash = {
    userId,
    passwordHash: knownHash,
    hashedAt: hashDate
  }

  const nonRecentUserPasswordHash: UserPasswordHash = {
    userId,
    passwordHash: knownHash,
    hashedAt: undefined
  }

  const otherRecentUserPasswordHash: UserPasswordHash = {
    userId,
    passwordHash: otherHash,
    hashedAt: hashDate
  }

  const authTokenConfig: AuthTokenConfig = {
    secret: 'this is a secret',
    expiryDurationMin: 5
  }

  async function notCalled(): Promise<any> {
    throw new Error('not to be called')
  }

  async function lockValidUser(
    lockUserId: string
  ): Promise<User | undefined> {
    assertEqual(lockUserId, userId)
    return user
  }

  async function lockValidUserByUsername(
    lockUsername: string
  ): Promise<User | undefined> {
    assertEqual(lockUsername, username)
    return user
  }

  async function lockNoPasswordUser(
    lockUserId: string
  ): Promise<User | undefined> {
    assertEqual(lockUserId, userId)
    return noPasswordUser
  }

  async function lockMissingUser(): Promise<User | undefined> {
    return undefined
  }

  function getUserPasswordHasher(
    result: UserPasswordHash | undefined
  ): (userId: string) => Promise<UserPasswordHash | undefined> {
    return async (userId: string) => {
      assertEqual(userId, user.id)
      return result
    }
  }

  async function insertRefreshToken(userId: string) {
    assertEqual(userId, user.id)
    return {
      id: 'a8d69fd5-1491-4b63-86ea-6d5e3c7f624d',
      userId
    }
  }

  it('add password sign-in-method', async () => {
    const addPasswordUserIf: AddPasswordUserIf = {
      lockUserById: lockNoPasswordUser,
      insertPasswordSignInMethod: async function(
        userPassword: NewUserPasswordHash
      ): Promise<void> {
        assertEqual(userPassword.userId, user.id)
        assertCurrentDateTime(userPassword.hashedAt)
        // There's no trivial way ensure hash is correct without using the same
        // implementation as in the tested code.
        assertEqual(
          await verifySecret(method.password, userPassword.passwordHash),
          true
        )
      },
      setUserUsername: async function(
        userId: string, username: string | null
      ): Promise<void> {
        assertEqual(userId, user.id)
        assertEqual(username, user.username)
      }
    }
    await addPasswordSignInMethod(addPasswordUserIf, userId, method, log)
  })

  it('fail to add password sign-in-method for missing user', async () => {
    const addPasswordUserIf: AddPasswordUserIf = {
      lockUserById: lockMissingUser,
      insertPasswordSignInMethod: notCalled,
      setUserUsername: notCalled,
    }
    expectReject(async () => {
      await addPasswordSignInMethod(addPasswordUserIf, userId, method, log)
    }, invalidCredentialsError)
  })

  it('fail to add password sign-in-method again', async () => {
    const addPasswordUserIf: AddPasswordUserIf = {
      lockUserById: lockValidUser,
      insertPasswordSignInMethod: notCalled,
      setUserUsername: notCalled,
    }
    expectReject(async () => {
      await addPasswordSignInMethod(addPasswordUserIf, userId, method, log)
    }, userAlreadyHasSignInMethodError)
  })

  // Other error cases are unit tested separately but just to be sure an
  // invalid password cannot be added, let's test it on this level too.
  it('fail to add too short password', async () => {
    const addPasswordUserIf: AddPasswordUserIf = {
      lockUserById: lockNoPasswordUser,
      insertPasswordSignInMethod: notCalled,
      setUserUsername: notCalled,
    }
    const method: PasswordSignInMethod = {
      username,
      password: 'passwor',
    }
    expectReject(async () => {
      await addPasswordSignInMethod(addPasswordUserIf, userId, method, log)
    }, passwordTooWeakError)
  })

  it('change password', async () => {
    const changePasswordUserIf: ChangePasswordUserIf = {
      lockUserById: lockValidUser,
      findPasswordSignInMethod: getUserPasswordHasher(recentUserPasswordHash),
      updatePassword: async function(
        userPassword: NewUserPasswordHash
      ): Promise<void> {
        assertEqual(userPassword.userId, user.id)
        assertCurrentDateTime(userPassword.hashedAt)
        // There's no trivial way ensure hash is correct without using the same
        // implementation as in the tested code.
        assertEqual(
          await verifySecret(
            passwordChange.newPassword, userPassword.passwordHash),
          true
        )
      },
    }
    await changePassword(changePasswordUserIf, userId, passwordChange)
  })

  it('fail to change password without user', async () => {
    const changePasswordUserIf: ChangePasswordUserIf = {
      lockUserById: lockMissingUser,
      findPasswordSignInMethod: notCalled,
      updatePassword: notCalled,
    }
    expectReject(async () => {
      await changePassword(changePasswordUserIf, userId, passwordChange)
    }, invalidCredentialsError)
  })

  it('fail to change password without sign-in-method', async () => {
    const changePasswordUserIf: ChangePasswordUserIf = {
      lockUserById: lockValidUser,
      findPasswordSignInMethod: getUserPasswordHasher(undefined),
      updatePassword: notCalled,
    }
    expectReject(async () => {
      await changePassword(changePasswordUserIf, userId, passwordChange)
    }, invalidCredentialsError)
  })

  it('fail to change password with wrong old password', async () => {
    const changePasswordUserIf: ChangePasswordUserIf = {
      lockUserById: lockValidUser,
      findPasswordSignInMethod:
        getUserPasswordHasher(otherRecentUserPasswordHash),
      updatePassword: notCalled,
    }
    expectReject(async () => {
      await changePassword(changePasswordUserIf, userId, passwordChange)
    }, invalidCredentialsError)
  })

  it('sign in using recently hashed password', async () => {
    const signInUsingPasswordIf: SignInUsingPasswordIf = {
      lockUserByUsername: lockValidUserByUsername,
      findPasswordSignInMethod: getUserPasswordHasher(recentUserPasswordHash),
      insertRefreshToken,
      updatePassword: notCalled
    }
    const result = await signInUsingPassword(
      signInUsingPasswordIf,
      method,
      authTokenConfig
    )
    assertDeepEqual(result.user, user)
    const reference = await authTokenService.createTokens(
      insertRefreshToken,
      user,
      authTokenConfig
    )
    assertDeepEqual(result.refreshToken, reference.refresh)
    assertDeepEqual(result.authToken, reference.auth)
  })

  it('sign in using non-recently hashed password', async () => {
    const userHashes: NewUserPasswordHash[] = []
    const updatePassword = async (userPasswordHash: NewUserPasswordHash) => {
      userHashes.push(userPasswordHash)
      return undefined
    }
    const signInUsingPasswordIf: SignInUsingPasswordIf = {
      lockUserByUsername: lockValidUserByUsername,
      findPasswordSignInMethod:
        getUserPasswordHasher(nonRecentUserPasswordHash),
      insertRefreshToken,
      updatePassword
    }
    const result = await signInUsingPassword(
      signInUsingPasswordIf,
      method,
      authTokenConfig
    )
    assertDeepEqual(result.user, user)
    const reference = await authTokenService.createTokens(
      insertRefreshToken,
      user,
      authTokenConfig
    )
    assertDeepEqual(result.refreshToken, reference.refresh)
    assertDeepEqual(result.authToken, reference.auth)
    assertEqual(userHashes.length, 1)
    const newHash = userHashes[0]
    assertEqual(newHash.userId, user.id)
    assertEqual(
      await verifySecret(knownPassword, newHash.passwordHash),
      true
    )
    assertCurrentDateTime(newHash.hashedAt)
  })

  it('fail to sign in using password without user', async () => {
    const signInUsingPasswordIf: SignInUsingPasswordIf = {
      lockUserByUsername: lockMissingUser,
      findPasswordSignInMethod: notCalled,
      insertRefreshToken: notCalled,
      updatePassword: notCalled
    }
    expectReject(async () => {
      await signInUsingPassword(signInUsingPasswordIf, method, authTokenConfig)
    }, invalidCredentialsError)
  })

  it('fail to sign in using password without password', async () => {
    const signInUsingPasswordIf: SignInUsingPasswordIf = {
      lockUserByUsername: lockValidUserByUsername,
      findPasswordSignInMethod: getUserPasswordHasher(undefined),
      insertRefreshToken: notCalled,
      updatePassword: notCalled
    }
    expectReject(async () => {
      await signInUsingPassword(signInUsingPasswordIf, method, authTokenConfig)
    }, invalidCredentialsError)
  })

  it('fail to sign in using password with wrong password', async () => {
    const signInUsingPasswordIf: SignInUsingPasswordIf = {
      lockUserByUsername: lockValidUserByUsername,
      findPasswordSignInMethod:
        getUserPasswordHasher(otherRecentUserPasswordHash),
      insertRefreshToken: notCalled,
      updatePassword: notCalled
    }
    expectReject(async () => {
      await signInUsingPassword(signInUsingPasswordIf, method, authTokenConfig)
    }, invalidCredentialsError)
  })
})
