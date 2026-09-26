import { describe, it } from 'node:test'

import * as styleService from '../../../src/logic/style/authorized.service.js'

import type { AuthTokenPayload } from '../../../src/logic/auth/auth-token.js'
import type {
  CreateStyleIf,
  UpdateStyleIf,
} from '../../../src/logic/style/style.js'
import { dummyLog as log } from '../dummy-log.js'
import { expectReject } from '../controller-error-helper.js'
import { invalidStyleError, noRightsError } from '../../../src/logic/errors.js'
import { assertDeepEqual } from '../../assert.js'
import { buildAuthTokenPayload } from '../auth/builders.js'
import {
  buildCreateStyleRequest,
  buildStyle,
  buildStyleWithParentIds,
  buildStyleWithParentsAndChildren,
  buildUpdateStyleRequest,
} from './builders.js'

const validCreateStyleRequest = buildCreateStyleRequest()

const validUpdateStyleRequest = buildUpdateStyleRequest()

const style = buildStyle()

const invalidStyleRequest = {
  name: 'This is invalid',
}

// Every parent a request refers to exists.
const createIf: CreateStyleIf = {
  create: async () => style,
  lockStyles: async (ids: string[]) => ids,
  insertParents: async () => {},
  listAllRelationships: async () => [],
}

const updateIf: UpdateStyleIf = {
  update: async () => style,
  lockStyles: async (ids: string[]) => ids,
  insertParents: async () => {},
  listAllRelationships: async () => [],
  deleteStyleChildRelationships: async () => {},
}

const adminAuthToken = buildAuthTokenPayload({ role: 'admin' })

const viewerAuthToken = buildAuthTokenPayload({ role: 'viewer' })

describe('style authorized service unit tests', () => {
  function notCalled(): any {
    throw new Error('not to be called')
  }

  it('create style as admin', async () => {
    await styleService.createStyle(
      createIf,
      () => ({ errorCode: undefined, result: validCreateStyleRequest }),
      {
        authTokenPayload: adminAuthToken,
        body: validCreateStyleRequest,
      },
      log,
    )
  })

  it('fail to create style as viewer', async () => {
    await expectReject(async () => {
      await styleService.createStyle(
        createIf,
        notCalled,
        {
          authTokenPayload: viewerAuthToken,
          body: validCreateStyleRequest,
        },
        log,
      )
    }, noRightsError)
  })

  it('fail to create invalid style as admin', async () => {
    await expectReject(async () => {
      await styleService.createStyle(
        createIf,
        () => ({ errorCode: 'invalid-style', result: undefined }),
        {
          authTokenPayload: adminAuthToken,
          body: invalidStyleRequest,
        },
        log,
      )
    }, invalidStyleError)
  })

  it('update style as admin', async () => {
    await styleService.updateStyle(
      updateIf,
      () => ({
        errorCode: undefined,
        result: { id: style.id, request: validUpdateStyleRequest },
      }),
      {
        authTokenPayload: adminAuthToken,
        id: style.id,
      },
      validUpdateStyleRequest,
      log,
    )
  })

  it('fail to update style as viewer', async () => {
    await expectReject(async () => {
      await styleService.updateStyle(
        updateIf,
        notCalled,
        {
          authTokenPayload: viewerAuthToken,
          id: style.id,
        },
        validUpdateStyleRequest,
        log,
      )
    }, noRightsError)
  })

  it('fail to update invalid style as admin', async () => {
    await expectReject(async () => {
      await styleService.updateStyle(
        updateIf,
        () => ({ errorCode: 'invalid-style', result: undefined }),
        {
          authTokenPayload: adminAuthToken,
          id: style.id,
        },
        invalidStyleRequest,
        log,
      )
    }, invalidStyleError)
  })
  ;[adminAuthToken, viewerAuthToken].forEach((token: AuthTokenPayload) => {
    it(`find style as ${token.role}`, async () => {
      const styleWithParentsAndChildren = buildStyleWithParentsAndChildren()
      const result = await styleService.findStyleById(
        async () => styleWithParentsAndChildren,
        () => ({
          errorCode: undefined,
          result: styleWithParentsAndChildren.id,
        }),
        {
          authTokenPayload: token,
          id: styleWithParentsAndChildren.id,
        },
        log,
      )
      assertDeepEqual(result, styleWithParentsAndChildren)
    })

    it(`list styles as ${token.role}`, async () => {
      const styleWithParentIds = buildStyleWithParentIds()
      const result = await styleService.listStyles(
        async () => [styleWithParentIds],
        token,
        log,
      )
      assertDeepEqual(result, [styleWithParentIds])
    })
  })
})
