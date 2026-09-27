import { suite, test } from '../../../test.js'
import { assertDeepEqual, assertEqual, assertTruthy } from '../../../assert.js'

import * as authTokenService from '../../../../src/logic/internal/auth/auth-token.service.js'

import {
  addPasswordSignInMethod,
  changePassword,
  signInUsingPassword,
} from '../../../../src/logic/internal/user/sign-in-method.service.js'

import type {
  AddPasswordUserIf,
  ChangePasswordUserIf,
  PasswordChange,
  PasswordSignInMethod,
  SignInUsingPasswordIf,
  UserPasswordHash,
} from '../../../../src/logic/user/sign-in-method.js'
import type { User } from '../../../../src/logic/user/user.js'
import type { ControllerError } from '../../../../src/logic/errors.js'
import {
  invalidCredentialsError,
  passwordTooLongError,
  passwordTooWeakError,
  userAlreadyHasSignInMethodError,
} from '../../../../src/logic/errors.js'
import { expectReject } from '../../controller-error-helper.js'
import { mockFunction } from '../../../mock.js'
import { dummyLog as log } from '../../dummy-log.js'
import type { AuthTokenConfig } from '../../../../src/logic/auth/auth-token.js'
import type { SignedInUser } from '../../../../src/logic/user/signed-in-user.js'
import { testJwtIf } from '../../jwt-helper.js'
import { buildUser } from '../../user/builders.js'

suite('password sign-in-method service unit tests', () => {
  const userId = '3b3adde6-c6a2-45f1-bd5e-bce71b8d835f'
  const username = 'user'
  const user = buildUser({ id: userId, username })

  // A user without a username has no password sign-in method yet.
  const noPasswordUser = buildUser({ id: userId, username: null })

  const knownPassword = 'password'

  const otherPassword = 'password1'

  const encryptedSecret = 'encrypted'

  const method: PasswordSignInMethod = {
    username,
    password: knownPassword,
  }

  const passwordChange: PasswordChange = {
    oldPassword: method.password,
    newPassword: otherPassword,
  }

  const userPasswordHash: UserPasswordHash = {
    userId,
    passwordHash: encryptedSecret,
  }

  const authTokenConfig: AuthTokenConfig = {
    secret: 'this is a secret',
    expiryDurationMin: 5,
  }

  async function notCalled(): Promise<any> {
    throw new Error('not to be called')
  }

  async function lockValidUser(lockUserId: string): Promise<User | undefined> {
    assertEqual(lockUserId, userId)
    return user
  }

  async function lockValidUserByUsername(
    lockUsername: string,
  ): Promise<User | undefined> {
    assertEqual(lockUsername, username)
    return user
  }

  async function lockNoPasswordUser(
    lockUserId: string,
  ): Promise<User | undefined> {
    assertEqual(lockUserId, userId)
    return noPasswordUser
  }

  async function lockMissingUser(): Promise<User | undefined> {
    return undefined
  }

  function getUserPasswordHasher(
    result: UserPasswordHash | undefined,
  ): (userId: string) => Promise<UserPasswordHash | undefined> {
    return async (userId: string) => {
      assertEqual(userId, user.id)
      return result
    }
  }

  const refreshTokenId = 'a8d69fd5-1491-4b63-86ea-6d5e3c7f624d'

  async function insertRefreshToken(userId: string) {
    assertEqual(userId, user.id)
    return {
      id: refreshTokenId,
      userId,
    }
  }

  // The token format belongs to the jwt layer. Here it matters that the
  // tokens were created and carry the signed in user.
  function expectTokensOf(signedInUser: SignedInUser) {
    assertTruthy(signedInUser.refreshToken.refreshToken)
    const authTokenPayload = authTokenService.verifyAuthToken(
      testJwtIf,
      signedInUser.authToken,
      authTokenConfig.secret,
    )
    assertDeepEqual(authTokenPayload, {
      userId: user.id,
      role: user.role,
      refreshTokenId,
    })
  }

  async function encryptSecret() {
    return encryptedSecret
  }

  async function passVerifySecret() {
    return true
  }

  async function failVerifySecret() {
    return false
  }

  function needsNoRehash(hash: string): boolean {
    assertEqual(hash, encryptedSecret)
    return false
  }

  function needsRehash(hash: string): boolean {
    assertEqual(hash, encryptedSecret)
    return true
  }

  function rehashNotChecked(): boolean {
    throw new Error('not to be called')
  }

  interface PasswordValidationFailureCase {
    name: string
    password: string
    error: ControllerError
  }

  const shortestPassword = 'password'
  const longestPassword = 'a'.repeat(255)

  const passwordValidationFailureCases: PasswordValidationFailureCase[] = [
    {
      name: 'one character too short',
      password: shortestPassword.slice(1),
      error: passwordTooWeakError,
    },
    {
      name: 'one character too long',
      password: `${longestPassword}a`,
      error: passwordTooLongError,
    },
  ]

  interface AcceptedPasswordCase {
    name: string
    password: string
  }

  const acceptedPasswordCases: AcceptedPasswordCase[] = [
    { name: 'of the shortest length', password: shortestPassword },
    { name: 'of the longest length', password: longestPassword },
  ]

  test('add password sign-in-method', async () => {
    const addPasswordUserIf: AddPasswordUserIf = {
      lockUserById: lockNoPasswordUser,
      encryptSecret,
      insertPasswordSignInMethod: async function (
        userPassword: UserPasswordHash,
      ): Promise<void> {
        assertEqual(userPassword.userId, user.id)
        assertEqual(userPassword.passwordHash, encryptedSecret)
      },
      setUserUsername: async function (
        userId: string,
        username: string | null,
      ): Promise<void> {
        assertEqual(userId, user.id)
        assertEqual(username, user.username)
      },
    }
    await addPasswordSignInMethod(addPasswordUserIf, userId, method, log)
  })

  acceptedPasswordCases.forEach((testCase) =>
    test(`add password sign-in-method with password ${
      testCase.name
    }`, async () => {
      const insertPasswordSignInMethod = mockFunction<
        [userPassword: UserPasswordHash],
        Promise<void>
      >(async () => undefined)
      const addPasswordUserIf: AddPasswordUserIf = {
        lockUserById: lockNoPasswordUser,
        encryptSecret,
        insertPasswordSignInMethod,
        setUserUsername: async (): Promise<void> => undefined,
      }
      await addPasswordSignInMethod(
        addPasswordUserIf,
        userId,
        {
          ...method,
          password: testCase.password,
        },
        log,
      )
      assertEqual(insertPasswordSignInMethod.mock.callCount(), 1)
    }),
  )

  passwordValidationFailureCases.forEach((testCase) =>
    test(`fail to add password sign-in-method with invalid password ${
      testCase.name
    }`, async () => {
      const addPasswordUserIf: AddPasswordUserIf = {
        lockUserById: lockNoPasswordUser,
        encryptSecret: notCalled,
        insertPasswordSignInMethod: notCalled,
        setUserUsername: notCalled,
      }
      await expectReject(async () => {
        await addPasswordSignInMethod(
          addPasswordUserIf,
          userId,
          {
            ...method,
            password: testCase.password,
          },
          log,
        )
      }, testCase.error)
    }),
  )

  test('fail to add password sign-in-method for missing user', async () => {
    const addPasswordUserIf: AddPasswordUserIf = {
      lockUserById: lockMissingUser,
      encryptSecret: notCalled,
      insertPasswordSignInMethod: notCalled,
      setUserUsername: notCalled,
    }
    await expectReject(async () => {
      await addPasswordSignInMethod(addPasswordUserIf, userId, method, log)
    }, invalidCredentialsError)
  })

  test('fail to add password sign-in-method again', async () => {
    const addPasswordUserIf: AddPasswordUserIf = {
      lockUserById: lockValidUser,
      encryptSecret: notCalled,
      insertPasswordSignInMethod: notCalled,
      setUserUsername: notCalled,
    }
    await expectReject(async () => {
      await addPasswordSignInMethod(addPasswordUserIf, userId, method, log)
    }, userAlreadyHasSignInMethodError)
  })

  test('change password', async () => {
    const changePasswordUserIf: ChangePasswordUserIf = {
      lockUserById: lockValidUser,
      findPasswordSignInMethod: getUserPasswordHasher(userPasswordHash),
      verifySecret: passVerifySecret,
      encryptSecret,
      updatePassword: async function (
        userPassword: UserPasswordHash,
      ): Promise<void> {
        assertEqual(userPassword.userId, user.id)
      },
    }
    await changePassword(changePasswordUserIf, userId, passwordChange, log)
  })

  acceptedPasswordCases.forEach((testCase) =>
    test(`change password to password ${testCase.name}`, async () => {
      const updatePassword = mockFunction<
        [userPassword: UserPasswordHash],
        Promise<void>
      >(async () => undefined)
      const changePasswordUserIf: ChangePasswordUserIf = {
        lockUserById: lockValidUser,
        findPasswordSignInMethod: getUserPasswordHasher(userPasswordHash),
        verifySecret: passVerifySecret,
        encryptSecret,
        updatePassword,
      }
      await changePassword(
        changePasswordUserIf,
        userId,
        {
          ...passwordChange,
          newPassword: testCase.password,
        },
        log,
      )
      assertEqual(updatePassword.mock.callCount(), 1)
    }),
  )

  passwordValidationFailureCases.forEach((testCase) =>
    test(`fail to change password with invalid password ${
      testCase.name
    }`, async () => {
      const changePasswordUserIf: ChangePasswordUserIf = {
        lockUserById: lockValidUser,
        findPasswordSignInMethod: getUserPasswordHasher(userPasswordHash),
        verifySecret: passVerifySecret,
        encryptSecret: notCalled,
        updatePassword: notCalled,
      }
      await expectReject(async () => {
        await changePassword(
          changePasswordUserIf,
          userId,
          {
            ...passwordChange,
            newPassword: testCase.password,
          },
          log,
        )
      }, testCase.error)
    }),
  )

  test('fail to change password with null username', async () => {
    const changePasswordUserIf: ChangePasswordUserIf = {
      lockUserById: async () => {
        return {
          ...user,
          username: null,
        }
      },
      findPasswordSignInMethod: notCalled,
      verifySecret: notCalled,
      encryptSecret: notCalled,
      updatePassword: notCalled,
    }
    await expectReject(async () => {
      await changePassword(changePasswordUserIf, userId, passwordChange, log)
    }, invalidCredentialsError)
  })

  test('fail to change password with empty username', async () => {
    const changePasswordUserIf: ChangePasswordUserIf = {
      lockUserById: async () => {
        return {
          ...user,
          username: '',
        }
      },
      findPasswordSignInMethod: notCalled,
      verifySecret: notCalled,
      encryptSecret: notCalled,
      updatePassword: notCalled,
    }
    await expectReject(async () => {
      await changePassword(changePasswordUserIf, userId, passwordChange, log)
    }, invalidCredentialsError)
  })

  test('fail to change password without user', async () => {
    const changePasswordUserIf: ChangePasswordUserIf = {
      lockUserById: lockMissingUser,
      findPasswordSignInMethod: notCalled,
      verifySecret: notCalled,
      encryptSecret: notCalled,
      updatePassword: notCalled,
    }
    await expectReject(async () => {
      await changePassword(changePasswordUserIf, userId, passwordChange, log)
    }, invalidCredentialsError)
  })

  test('fail to change password without sign-in-method', async () => {
    const changePasswordUserIf: ChangePasswordUserIf = {
      lockUserById: lockValidUser,
      findPasswordSignInMethod: getUserPasswordHasher(undefined),
      verifySecret: notCalled,
      encryptSecret: notCalled,
      updatePassword: notCalled,
    }
    await expectReject(async () => {
      await changePassword(changePasswordUserIf, userId, passwordChange, log)
    }, invalidCredentialsError)
  })

  test('fail to change password with wrong old password', async () => {
    const changePasswordUserIf: ChangePasswordUserIf = {
      lockUserById: lockValidUser,
      findPasswordSignInMethod: getUserPasswordHasher(userPasswordHash),
      verifySecret: failVerifySecret,
      encryptSecret: notCalled,
      updatePassword: notCalled,
    }
    await expectReject(async () => {
      await changePassword(changePasswordUserIf, userId, passwordChange, log)
    }, invalidCredentialsError)
  })

  test('sign in without rehashing password in current format', async () => {
    const signInUsingPasswordIf: SignInUsingPasswordIf = {
      lockUserByUsername: lockValidUserByUsername,
      findPasswordSignInMethod: getUserPasswordHasher(userPasswordHash),
      verifySecret: passVerifySecret,
      rejectSecret: notCalled,
      needsRehash: needsNoRehash,
      encryptSecret: notCalled,
      insertRefreshToken,
      updatePassword: notCalled,
    }
    const result = await signInUsingPassword(
      testJwtIf,
      signInUsingPasswordIf,
      method,
      authTokenConfig,
      log,
    )
    assertDeepEqual(result.user, user)
    expectTokensOf(result)
  })

  test('sign in and rehash password in outdated format', async () => {
    const userHashes: UserPasswordHash[] = []
    const updatePassword = async (userPasswordHash: UserPasswordHash) => {
      userHashes.push(userPasswordHash)
      return undefined
    }
    const signInUsingPasswordIf: SignInUsingPasswordIf = {
      lockUserByUsername: lockValidUserByUsername,
      findPasswordSignInMethod: getUserPasswordHasher(userPasswordHash),
      verifySecret: passVerifySecret,
      rejectSecret: notCalled,
      needsRehash,
      encryptSecret,
      insertRefreshToken,
      updatePassword,
    }
    const result = await signInUsingPassword(
      testJwtIf,
      signInUsingPasswordIf,
      method,
      authTokenConfig,
      log,
    )
    assertDeepEqual(result.user, user)
    expectTokensOf(result)
    assertEqual(userHashes.length, 1)
    const newHash = userHashes[0]
    assertEqual(newHash.userId, user.id)
    assertEqual(newHash.passwordHash, encryptedSecret)
  })

  test('fail to sign in using password without user after the work of a password check', async () => {
    const rejectedSecrets: string[] = []
    const signInUsingPasswordIf: SignInUsingPasswordIf = {
      lockUserByUsername: lockMissingUser,
      findPasswordSignInMethod: notCalled,
      verifySecret: notCalled,
      rejectSecret: async (_logger: unknown, secret: string) => {
        rejectedSecrets.push(secret)
      },
      needsRehash: rehashNotChecked,
      encryptSecret: notCalled,
      insertRefreshToken: notCalled,
      updatePassword: notCalled,
    }
    await expectReject(async () => {
      await signInUsingPassword(
        testJwtIf,
        signInUsingPasswordIf,
        method,
        authTokenConfig,
        log,
      )
    }, invalidCredentialsError)
    assertDeepEqual(rejectedSecrets, [method.password])
  })

  test('fail to sign in using password without password after the work of a password check', async () => {
    const rejectedSecrets: string[] = []
    const signInUsingPasswordIf: SignInUsingPasswordIf = {
      lockUserByUsername: lockValidUserByUsername,
      findPasswordSignInMethod: getUserPasswordHasher(undefined),
      verifySecret: notCalled,
      rejectSecret: async (_logger: unknown, secret: string) => {
        rejectedSecrets.push(secret)
      },
      needsRehash: rehashNotChecked,
      encryptSecret: notCalled,
      insertRefreshToken: notCalled,
      updatePassword: notCalled,
    }
    await expectReject(async () => {
      await signInUsingPassword(
        testJwtIf,
        signInUsingPasswordIf,
        method,
        authTokenConfig,
        log,
      )
    }, invalidCredentialsError)
    assertDeepEqual(rejectedSecrets, [method.password])
  })

  test('fail to sign in using password with wrong password', async () => {
    const signInUsingPasswordIf: SignInUsingPasswordIf = {
      lockUserByUsername: lockValidUserByUsername,
      findPasswordSignInMethod: getUserPasswordHasher(userPasswordHash),
      verifySecret: failVerifySecret,
      rejectSecret: notCalled,
      needsRehash: rehashNotChecked,
      encryptSecret: notCalled,
      insertRefreshToken: notCalled,
      updatePassword: notCalled,
    }
    await expectReject(async () => {
      await signInUsingPassword(
        testJwtIf,
        signInUsingPasswordIf,
        method,
        authTokenConfig,
        log,
      )
    }, invalidCredentialsError)
  })
})
