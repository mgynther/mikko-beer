import { describe, it } from 'node:test'

import * as styleService from '../../../../src/logic/internal/style/validated.service.js'

import type {
  CreateStyleIf,
  UpdateStyleIf,
  ValidateCreateStyle,
  ValidateUpdateStyle,
} from '../../../../src/logic/style/style.js'
import { dummyLog as log } from '../../dummy-log.js'
import { expectReject } from '../../controller-error-helper.js'
import {
  invalidStyleError,
  invalidStyleIdError,
} from '../../../../src/logic/errors.js'
import { assertDeepEqual, assertEqual } from '../../../assert.js'
import {
  buildCreateStyleRequest,
  buildStyle,
  buildStyleWithParentIds,
  buildStyleWithParentsAndChildren,
  buildUpdateStyleRequest,
} from '../../style/builders.js'

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

const passCreateValidation: ValidateCreateStyle = (input: unknown) => {
  assertDeepEqual(input, validCreateStyleRequest)
  return {
    errorCode: undefined,
    result: validCreateStyleRequest,
  }
}

const failCreateValidation: ValidateCreateStyle = () => {
  return {
    errorCode: 'invalid-style',
    result: undefined,
  }
}

const passUpdateValidation: ValidateUpdateStyle = (
  input: unknown,
  id: string | undefined,
) => {
  assertDeepEqual(input, validUpdateStyleRequest)
  assertEqual(id, style.id)
  return {
    errorCode: undefined,
    result: {
      id: style.id,
      request: validUpdateStyleRequest,
    },
  }
}

const failUpdateValidationWithStyle: ValidateUpdateStyle = () => {
  return {
    errorCode: 'invalid-style',
    result: undefined,
  }
}

const failUpdateValidationWithId: ValidateUpdateStyle = () => {
  return {
    errorCode: 'invalid-style-id',
    result: undefined,
  }
}

describe('style validated service unit tests', () => {
  it('create style', async () => {
    await styleService.createStyle(
      createIf,
      passCreateValidation,
      validCreateStyleRequest,
      log,
    )
  })

  it('fail to create invalid style', async () => {
    await expectReject(async () => {
      await styleService.createStyle(
        createIf,
        failCreateValidation,
        invalidStyleRequest,
        log,
      )
    }, invalidStyleError)
  })

  it('update style', async () => {
    await styleService.updateStyle(
      updateIf,
      passUpdateValidation,
      style.id,
      validUpdateStyleRequest,
      log,
    )
  })

  it('fail to update style with invalid style', async () => {
    await expectReject(async () => {
      await styleService.updateStyle(
        updateIf,
        failUpdateValidationWithStyle,
        style.id,
        invalidStyleRequest,
        log,
      )
    }, invalidStyleError)
  })

  it('fail to update style with undefined id', async () => {
    await expectReject(async () => {
      await styleService.updateStyle(
        updateIf,
        failUpdateValidationWithId,
        undefined,
        validUpdateStyleRequest,
        log,
      )
    }, invalidStyleIdError)
  })

  it('find style by id', async () => {
    const styleWithParentsAndChildren = buildStyleWithParentsAndChildren()
    const result = await styleService.findStyleById(
      async () => styleWithParentsAndChildren,
      () => ({ errorCode: undefined, result: styleWithParentsAndChildren.id }),
      styleWithParentsAndChildren.id,
      log,
    )
    assertDeepEqual(result, styleWithParentsAndChildren)
  })

  function notCalled(): any {
    throw new Error('not to be called')
  }

  it('fail to find style by invalid id', async () => {
    await expectReject(async () => {
      await styleService.findStyleById(
        notCalled,
        () => ({ errorCode: 'invalid-style-id', result: undefined }),
        undefined,
        log,
      )
    }, invalidStyleIdError)
  })

  it('list styles', async () => {
    const styles = [buildStyleWithParentIds()]
    const result = await styleService.listStyles(async () => styles, log)
    assertDeepEqual(result, styles)
  })
})
