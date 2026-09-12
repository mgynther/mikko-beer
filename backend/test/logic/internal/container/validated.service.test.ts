import { describe, it } from 'node:test'

import * as containerService from '../../../../src/logic/internal/container/validated.service.js'

import type {
  Container,
  CreateContainerRequest,
  UpdateContainerRequest,
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

const validCreateContainerRequest: CreateContainerRequest = {
  size: '0.33',
  type: 'bottle',
}

const validUpdateContainerRequest: UpdateContainerRequest = {
  size: '0.44',
  type: 'can',
}

const container: Container = {
  id: '48310f6a-1637-467f-9bc5-3b6406bd403e',
  size: validCreateContainerRequest.size,
  type: validCreateContainerRequest.type,
}

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

describe('container authorized service unit tests', () => {
  it('create container', async () => {
    await containerService.createContainer(
      create,
      passCreateValidation,
      validCreateContainerRequest,
      log,
    )
  })

  it('fail to create invalid container', async () => {
    await expectReject(async () => {
      await containerService.createContainer(
        create,
        failCreateValidation,
        invalidContainerRequest,
        log,
      )
    }, invalidContainerError)
  })

  it('update container', async () => {
    await containerService.updateContainer(
      update,
      passUpdateValidation,
      container.id,
      validUpdateContainerRequest,
      log,
    )
  })

  it('fail to update container with invalid container', async () => {
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

  it('fail to update container with undefined id', async () => {
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

  it('find container by id', async () => {
    const id = '31835df3-128a-41c6-9cc5-6ac663113d04'
    await containerService.findContainerById(
      async () => ({ id, size: '0.33', type: 'bottle' }),
      () => ({ errorCode: undefined, result: id }),
      id,
      log,
    )
  })

  function notCalled(): any {
    throw new Error('not to be called')
  }

  it('fail to find container by invalid id', async () => {
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
