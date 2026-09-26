import { suite, test } from '../../../test.js'

import * as containerService from '../../../../src/logic/internal/container/validated.service.js'

import type {
  Container,
  CreateContainerRequest,
  ValidateCreateContainer,
  ValidateUpdateContainer,
} from '../../../../src/logic/container/container.js'
import { dummyLog as log } from '../../dummy-log.js'
import { expectReject } from '../../controller-error-helper.js'
import {
  invalidContainerError,
  invalidContainerIdError,
} from '../../../../src/logic/errors.js'
import { assertDeepEqual, assertEqual } from '../../../assert.js'
import {
  buildContainer,
  buildCreateContainerRequest,
  buildUpdateContainerRequest,
} from '../../container/builders.js'

const validCreateContainerRequest = buildCreateContainerRequest()

const validUpdateContainerRequest = buildUpdateContainerRequest()

const container = buildContainer()

const invalidContainerRequest = {
  size: '0.44',
}

const create: (
  container: CreateContainerRequest,
) => Promise<Container> = async () => container
const update: (container: Container) => Promise<Container> = async () =>
  container

const passCreateValidation: ValidateCreateContainer = (input: unknown) => {
  assertDeepEqual(input, validCreateContainerRequest)
  return {
    errorCode: undefined,
    result: validCreateContainerRequest,
  }
}

const failCreateValidation: ValidateCreateContainer = () => {
  return {
    errorCode: 'invalid-container',
    result: undefined,
  }
}

const passUpdateValidation: ValidateUpdateContainer = (
  input: unknown,
  id: string | undefined,
) => {
  assertDeepEqual(input, validUpdateContainerRequest)
  assertEqual(id, container.id)
  return {
    errorCode: undefined,
    result: {
      id: container.id,
      request: validUpdateContainerRequest,
    },
  }
}

const failUpdateValidationWithContainer: ValidateUpdateContainer = () => {
  return {
    errorCode: 'invalid-container',
    result: undefined,
  }
}

const failUpdateValidationWithId: ValidateUpdateContainer = () => {
  return {
    errorCode: 'invalid-container-id',
    result: undefined,
  }
}

suite('container validated service unit tests', () => {
  test('create container', async () => {
    await containerService.createContainer(
      create,
      passCreateValidation,
      validCreateContainerRequest,
      log,
    )
  })

  test('fail to create invalid container', async () => {
    await expectReject(async () => {
      await containerService.createContainer(
        create,
        failCreateValidation,
        invalidContainerRequest,
        log,
      )
    }, invalidContainerError)
  })

  test('update container', async () => {
    await containerService.updateContainer(
      update,
      passUpdateValidation,
      container.id,
      validUpdateContainerRequest,
      log,
    )
  })

  test('fail to update container with invalid container', async () => {
    await expectReject(async () => {
      await containerService.updateContainer(
        update,
        failUpdateValidationWithContainer,
        container.id,
        invalidContainerRequest,
        log,
      )
    }, invalidContainerError)
  })

  test('fail to update container with undefined id', async () => {
    await expectReject(async () => {
      await containerService.updateContainer(
        update,
        failUpdateValidationWithId,
        undefined,
        validUpdateContainerRequest,
        log,
      )
    }, invalidContainerIdError)
  })

  test('find container by id', async () => {
    const found = buildContainer()
    const result = await containerService.findContainerById(
      async () => found,
      () => ({ errorCode: undefined, result: found.id }),
      found.id,
      log,
    )
    assertDeepEqual(result, found)
  })

  function notCalled(): any {
    throw new Error('not to be called')
  }

  test('fail to find container by invalid id', async () => {
    await expectReject(async () => {
      await containerService.findContainerById(
        notCalled,
        () => ({ errorCode: 'invalid-container-id', result: undefined }),
        undefined,
        log,
      )
    }, invalidContainerIdError)
  })
})
