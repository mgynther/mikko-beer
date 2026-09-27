import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import { testConfig } from '../test-config.js'
import { assertEqual } from '../../assert.js'
import { passwordHashParameters } from '../../../src/wiring/password-hash-parameters.js'
import { findPasswordSignInMethod } from '../../../src/data/user/sign-in-method/sign-in-method.repository.js'

suite('production password hashing', () => {
  const ctx = new TestContext(undefined, {
    ...testConfig,
    passwordHashParameters,
  })

  before(ctx.before)
  beforeEach(ctx.beforeEach)
  afterEach(ctx.afterEach)
  after(ctx.after)

  test('hash with production parameters and sign in', async () => {
    const { user, username, password } = await ctx.createUser()

    const signInMethod = await ctx.db.executeReadWriteTransaction(
      async (trx) => await findPasswordSignInMethod(trx, user.id),
    )
    assertEqual(
      signInMethod?.passwordHash.startsWith('$scrypt$ln=15,r=8,p=3$'),
      true,
    )

    const res = await ctx.request.post(`/api/v1/user/sign-in`, {
      username,
      password,
    })
    assertEqual(res.status, 200)
  })
})
