import { expect } from 'chai'

import {
  type AddPasswordUserIf,
  type ChangePasswordUserIf,
  type SignInUsingPasswordIf,
  addPasswordSignInMethod,
  changePassword,
  encryptPassword,
  signInUsingPassword,
  verifySecret
} from '../../../src/core/user/sign-in-method.service'

import { type Tokens } from '../../../src/core/authentication/tokens'
import {
  type PasswordChange,
  type PasswordSignInMethod,
  type UserPasswordHash,
} from '../../../src/core/user/sign-in-method'
import { Role, User } from '../../../src/core/user/user'
import {
  invalidCredentialsError,
  passwordTooLongError,
  passwordTooWeakError,
  userAlreadyHasSignInMethodError
} from '../../../src/core/errors'

function unreachable() {
  expect('supposed to be unreachable').to.equal(true)
}

describe('encrypt and verify password', () => {
  it('fail to encrypt too short password', async () => {
    try {
      await encryptPassword('passwor')
      unreachable()
    } catch (e) {
      expect(e).to.eql(passwordTooWeakError)
    }
  })

  it('fail to encrypt too long password', async () => {
    try {
      await encryptPassword('password'.repeat(100))
      unreachable()
    } catch (e) {
      expect(e).to.eql(passwordTooLongError)
    }
  })

  it('encrypt password and verify password', async () => {
    const password = 'password'
    const result = await encryptPassword(password)
    // Sanity check format without being specific.
    expect(result.length).to.be.greaterThan(30)
    const [salt, hashedPassword] = result.split(':')
    expect(salt.length).to.be.greaterThan(10)
    expect(hashedPassword.length).to.be.greaterThan(20)
    // There's no trivial way ensure hash is correct without using the same
    // implementation as in the tested code.
    expect(await verifySecret(password, result)).to.equal(true)
    // While ensuring correctness is hard, it's trivial to ensure wrong
    // password fails.
    expect(await verifySecret(`${password}1`, result)).to.equal(false)
  })
})

describe('password sign-in-method service unit tests', () => {
  const userId = '3b3adde6-c6a2-45f1-bd5e-bce71b8d835f'
  const username = 'user'
  const user: User = {
    id: userId,
    role: Role.admin,
    username: username
  }

  const noPasswordUser: User = {
    id: userId,
    role: Role.admin,
    username: null,
  }

  const knownPassword = 'password'
  const knownHash = '3571471e876241089e4e29130fd96cf0:6b26a82522532fca44ba7fef2f6b6f5d930fb2e2179f7cdcd682470d15a4cc4296b7f77c59bf317fa7281900626cf7b4499948d9d0f4718ae1170d4a63e35f36'

  const otherPassword = 'password1'
  const otherHash = 'c4e457548452abcaf38f97cfce412926:8af0071d2da359277beea4a9c3232d898b975e9ed9170bdea77578667f753f08970144297a5cd9382acbcb9a5341f3e0e0026c1c7d877dcfbce2abd3f528bb9f'

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
    passwordHash: knownHash,
  }

  const dummyTokens: Tokens = {
    refresh: {
      refreshToken: 'dummy'
    },
    auth: {
      authToken: 'dummy'
    }
  }

  async function notCalled(): Promise<any> {
    expect('not to be called').to.equal(true)
  }

  async function lockValidUser(
    lockUserId: string
  ): Promise<User | undefined> {
    expect(lockUserId).to.equal(userId)
    return user
  }

  async function lockValidUserByUsername(
    lockUsername: string
  ): Promise<User | undefined> {
    expect(lockUsername).to.equal(username)
    return user
  }

  async function lockNoPasswordUser(
    lockUserId: string
  ): Promise<User | undefined> {
    expect(lockUserId).to.equal(userId)
    return noPasswordUser
  }

  async function lockMissingUser(): Promise<User | undefined> {
    return undefined
  }

  async function getUserPasswordHash(
    userId: string
  ): Promise<UserPasswordHash | undefined> {
    expect(userId).to.equal(user.id)
    return userPasswordHash
  }

  async function getOtherPasswordHash(
    userId: string
  ): Promise<UserPasswordHash | undefined> {
    expect(userId).to.equal(user.id)
    return {
      userId,
      passwordHash: otherHash
    }
  }

  async function getMissingPasswordHash(
    userId: string
  ): Promise<UserPasswordHash | undefined> {
    expect(userId).to.equal(user.id)
    return undefined
  }

  async function createDummyTokens(
    dummyUser: User
  ): Promise<Tokens> {
    expect(dummyUser).to.eql(user)
    return dummyTokens
  }

  it('add password sign-in-method', async () => {
    const addPasswordUserIf: AddPasswordUserIf = {
      lockUserById: lockNoPasswordUser,
      insertPasswordSignInMethod: async function(
        userPassword: UserPasswordHash
      ): Promise<void> {
        expect(userPassword.userId).to.equal(user.id)
        // There's no trivial way ensure hash is correct without using the same
        // implementation as in the tested code.
        expect(
          await verifySecret(method.password, userPassword.passwordHash)
        ).to.equal(true)
      },
      setUserUsername: async function(
        userId: string, username: string
      ): Promise<void> {
        expect(userId).to.equal(user.id)
        expect(username).to.equal(user.username)
      }
    }
    await addPasswordSignInMethod(addPasswordUserIf, userId, method)
  })

  it('fail to add password sign-in-method for missing user', async () => {
    const addPasswordUserIf: AddPasswordUserIf = {
      lockUserById: lockMissingUser,
      insertPasswordSignInMethod: notCalled,
      setUserUsername: notCalled,
    }
    try {
      await addPasswordSignInMethod(addPasswordUserIf, userId, method)
      unreachable()
    } catch (e) {
      expect(e).to.eql(invalidCredentialsError)
    }
  })

  it('fail to add password sign-in-method again', async () => {
    const addPasswordUserIf: AddPasswordUserIf = {
      lockUserById: lockValidUser,
      insertPasswordSignInMethod: notCalled,
      setUserUsername: notCalled,
    }
    try {
      await addPasswordSignInMethod(addPasswordUserIf, userId, method)
      unreachable()
    } catch (e) {
      expect(e).to.eql(userAlreadyHasSignInMethodError)
    }
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
    try {
      await addPasswordSignInMethod(addPasswordUserIf, userId, method)
      unreachable()
    } catch (e) {
      expect(e).to.equal(passwordTooWeakError)
    }
  })

  it('change password', async () => {
    const changePasswordUserIf: ChangePasswordUserIf = {
      lockUserById: lockValidUser,
      findPasswordSignInMethod: getUserPasswordHash,
      updatePassword: async function(
        userPassword: UserPasswordHash
      ): Promise<void> {
        expect(userPassword.userId).to.equal(user.id)
        // There's no trivial way ensure hash is correct without using the same
        // implementation as in the tested code.
        expect(
          await verifySecret(
            passwordChange.newPassword, userPassword.passwordHash
          )
        ).to.equal(true)
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
    try {
      await changePassword(changePasswordUserIf, userId, passwordChange)
      unreachable()
    } catch (e) {
      expect(e).to.eql(invalidCredentialsError)
    }
  })

  it('fail to change password without sign-in-method', async () => {
    const changePasswordUserIf: ChangePasswordUserIf = {
      lockUserById: lockValidUser,
      findPasswordSignInMethod: getMissingPasswordHash,
      updatePassword: notCalled,
    }
    try {
      await changePassword(changePasswordUserIf, userId, passwordChange)
      unreachable()
    } catch (e) {
      expect(e).to.eql(invalidCredentialsError)
    }
  })

  it('fail to change password with wrong old password', async () => {
    const changePasswordUserIf: ChangePasswordUserIf = {
      lockUserById: lockValidUser,
      findPasswordSignInMethod: getOtherPasswordHash,
      updatePassword: notCalled,
    }
    try {
      await changePassword(changePasswordUserIf, userId, passwordChange)
      unreachable()
    } catch (e) {
      expect(e).to.equal(invalidCredentialsError)
    }
  })

  it('sign in using password', async () => {
    const signInUsingPasswordIf: SignInUsingPasswordIf = {
      lockUserByUsername: lockValidUserByUsername,
      findPasswordSignInMethod: getUserPasswordHash,
      createTokens: createDummyTokens,
    }
    const result = await signInUsingPassword(signInUsingPasswordIf, method)
    expect(result.user).to.eql(user)
    expect(result.refreshToken).to.eql(dummyTokens.refresh)
    expect(result.authToken).to.eql(dummyTokens.auth)
  })

  it('fail to sign in using password without user', async () => {
    const signInUsingPasswordIf: SignInUsingPasswordIf = {
      lockUserByUsername: lockMissingUser,
      findPasswordSignInMethod: notCalled,
      createTokens: notCalled
    }
    try {
      await signInUsingPassword(signInUsingPasswordIf, method)
      unreachable()
    } catch (e) {
      expect(e).to.eql(invalidCredentialsError)
    }
  })

  it('fail to sign in using password without password', async () => {
    const signInUsingPasswordIf: SignInUsingPasswordIf = {
      lockUserByUsername: lockValidUserByUsername,
      findPasswordSignInMethod: getMissingPasswordHash,
      createTokens: notCalled
    }
    try {
      await signInUsingPassword(signInUsingPasswordIf, method)
      unreachable()
    } catch (e) {
      expect(e).to.equal(invalidCredentialsError)
    }
  })

  it('fail to sign in using password with wrong password', async () => {
    const signInUsingPasswordIf: SignInUsingPasswordIf = {
      lockUserByUsername: lockValidUserByUsername,
      findPasswordSignInMethod: getOtherPasswordHash,
      createTokens: notCalled
    }
    try {
      await signInUsingPassword(signInUsingPasswordIf, method)
      unreachable()
    } catch (e) {
      expect(e).to.equal(invalidCredentialsError)
    }
  })
})
