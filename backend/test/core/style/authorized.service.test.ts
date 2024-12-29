import { expect } from 'earl'
import * as styleService from '../../../src/core/style/authorized.service'

import type { AuthTokenPayload } from '../../../src/core/auth/auth-token'
import type {
  Style,
  StyleWithParentIds,
  StyleWithParentsAndChildren,
  CreateStyleRequest,
  CreateStyleIf,
  UpdateStyleRequest,
  UpdateStyleIf
} from '../../../src/core/style/style'
import { Role } from '../../../src/core/user/user'
import { dummyLog as log } from '../dummy-log'
import { expectReject } from '../controller-error-helper'
import {
  invalidStyleError,
  noRightsError
} from '../../../src/core/errors'

const styleId = '6e68f545-097c-4f1a-af81-23c2f9cdb533'

const validCreateStyleRequest: CreateStyleRequest = {
  name: 'American IPA',
  parents: []
}

const validUpdateStyleRequest: UpdateStyleRequest = {
  name: 'American IPA',
  parents: []
}

const style: Style = {
  id: '10a312cd-b173-4287-9bfa-f22de79cfb0e',
  name: validCreateStyleRequest.name
}

const invalidStyleRequest = {
  name: 'This is invalid'
}

const createIf: CreateStyleIf = {
  create: async () => style,
  lockStyles: async () => [styleId],
  insertParents: async () => {},
  listAllRelationships: async () => []
}

const updateIf: UpdateStyleIf = {
  update: async () => style,
  lockStyles: async () => [styleId],
  insertParents: async () => {},
  listAllRelationships: async () => [],
  deleteStyleChildRelationships: async () => {}
}

const adminAuthToken: AuthTokenPayload = {
  userId: 'd60705aa-81c7-41b2-9ea6-552b62de196e',
  role: Role.admin,
  refreshTokenId: '561e1675-77a5-4fdb-a92f-29ab58fd02e5'
}

const viewerAuthToken: AuthTokenPayload = {
  userId: '8bb74120-5d80-4ebd-8597-6de643ee6d63',
  role: Role.viewer,
  refreshTokenId: '2223ec08-40e9-4fda-a5db-c66bafa796cc'
}

describe('style authorized service unit tests', () => {
  it('create style as admin', async () => {
    await styleService.createStyle(createIf, {
      authTokenPayload: adminAuthToken,
      body: validCreateStyleRequest
    }, log)
  })

  it('fail to create style as viewer', async () => {
    await expectReject(async () => {
      await styleService.createStyle(createIf, {
        authTokenPayload: viewerAuthToken,
        body: validCreateStyleRequest
      }, log)
    }, noRightsError)
  })

  it('fail to create invalid style as admin', async () => {
    await expectReject(async () => {
      await styleService.createStyle(createIf, {
        authTokenPayload: adminAuthToken,
        body: invalidStyleRequest
      }, log)
    }, invalidStyleError)
  })

  it('update style as admin', async () => {
    await styleService.updateStyle(updateIf, {
      authTokenPayload: adminAuthToken,
      id: style.id
    }, validUpdateStyleRequest, log)
  })

  it('fail to update style as viewer', async () => {
    await expectReject(async () => {
      await styleService.updateStyle(updateIf, {
        authTokenPayload: viewerAuthToken,
        id: style.id
      }, validUpdateStyleRequest, log)
    }, noRightsError)
  })

  it('fail to update invalid style as admin', async () => {
    await expectReject(async () => {
      await styleService.updateStyle(updateIf, {
        authTokenPayload: adminAuthToken,
        id: style.id
      }, invalidStyleRequest, log)
    }, invalidStyleError)
  })
  ;

  [adminAuthToken, viewerAuthToken].forEach((token: AuthTokenPayload) => {
    it(`find style as ${token.role}`, async () => {
      const styleWithParentsAndChilden: StyleWithParentsAndChildren = {
        ...style,
        children: [],
        parents: []
      }
      const result = await styleService.findStyleById(
        async () => styleWithParentsAndChilden,
        {
          authTokenPayload: token,
          id: style.id
        },
        log
      )
      expect(result).toEqual(styleWithParentsAndChilden)
    })

    it(`list styles as ${token.role}`, async () => {
      const styleWithParentIds: StyleWithParentIds = {
        ...style,
        parents: []
      }
      const result = await styleService.listStyles(
        async () => [styleWithParentIds],
        token,
        log
      )
      expect(result).toEqual([styleWithParentIds])
    })
  })

})
