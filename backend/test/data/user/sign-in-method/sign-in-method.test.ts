import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../../test-context.js'
import * as signInMethodRepository from '../../../../src/data/user/sign-in-method/sign-in-method.repository.js'
import { assertEqual } from '../../../assert.js'

describe('sign-in-method tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('return undefined sign-in-method when it does not exist', async () => {
    const signInMethod = await ctx.db.executeReadWriteTransaction(
      async (trx) => {
        return await signInMethodRepository.findPasswordSignInMethod(
          trx,
          '5b99be2f-5c0f-4fcf-bb72-e3af3110b0e1',
        )
      },
    )
    assertEqual(signInMethod, undefined)
  })
})
