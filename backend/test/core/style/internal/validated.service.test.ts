import * as styleService from '../../../../src/core/style/internal/validated.service'

import type {
  Style,
  CreateStyleRequest,
  CreateStyleIf,
  UpdateStyleRequest,
  UpdateStyleIf
} from '../../../../src/core/style/style'
import { dummyLog as log } from '../../dummy-log'
import { expectReject } from '../../controller-error-helper'
import {
  invalidStyleError,
  invalidStyleIdError,
} from '../../../../src/core/errors'

const styleId = 'af011f79-7e68-4f64-87dd-4b45c8e175dc'

const validCreateStyleRequest: CreateStyleRequest = {
  name: 'American IPA',
  parents: []
}

const validUpdateStyleRequest: UpdateStyleRequest = {
  name: 'American IPA',
  parents: []
}

const style: Style = {
  id: '3db5f19b-fa63-4296-bb18-891c2bbfa80d',
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

describe('style authorized service unit tests', () => {
  it('create style', async () => {
    await styleService.createStyle(createIf, validCreateStyleRequest, log)
  })

  it('fail to create invalid style', async () => {
    await expectReject(async () => {
      await styleService.createStyle(createIf, invalidStyleRequest, log)
    }, invalidStyleError)
  })

  it('update style', async () => {
    await styleService.updateStyle(
      updateIf,
      style.id,
      validUpdateStyleRequest,
      log
    )
  })

  it('fail to update invalid style', async () => {
    await expectReject(async () => {
      await styleService.updateStyle(
        updateIf,
        style.id,
        invalidStyleRequest,
        log
      )
    }, invalidStyleError)
  })

  it('fail to update style with undefined id', async () => {
    await expectReject(async () => {
      await styleService.updateStyle(
        updateIf,
        undefined,
        validUpdateStyleRequest,
        log
      )
    }, invalidStyleIdError)
  })
})
