import * as containerService from '../../../../src/core/container/internal/validated.service'

import type {
  Container,
  CreateContainerRequest,
  NewContainer,
  UpdateContainerRequest
} from '../../../../src/core/container/container'
import { dummyLog as log } from '../../dummy-log'
import { expectReject } from '../../controller-error-helper'
import {
  invalidContainerError,
  invalidContainerIdError,
} from '../../../../src/core/errors'

const validCreateContainerRequest: CreateContainerRequest = {
  size: '0.33',
  type: 'bottle'
}

const validUpdateContainerRequest: UpdateContainerRequest = {
  size: '0.44',
  type: 'can'
}

const container: Container = {
  id: '48310f6a-1637-467f-9bc5-3b6406bd403e',
  size: validCreateContainerRequest.size,
  type: validCreateContainerRequest.type
}

const invalidContainerRequest = {
  size: '0.44'
}

const create: (
  container: NewContainer
) => Promise<Container> = async () => container
const update: (
  container: Container
) => Promise<Container> = async () => container

describe('container authorized service unit tests', () => {
  it('create container', async () => {
    await containerService.createContainer(
      create,
      validCreateContainerRequest,
      log
    )
  })

  it('fail to create invalid container', async () => {
    await expectReject(async () => {
      await containerService.createContainer(
        create,
        invalidContainerRequest,
        log
      )
    }, invalidContainerError)
  })

  it('update container', async () => {
    await containerService.updateContainer(
      update,
      container.id,
      validUpdateContainerRequest,
      log
    )
  })

  it('fail to update container with invalid container', async () => {
    await expectReject(async () => {
      await containerService.updateContainer(
        update,
        container.id,
        invalidContainerRequest,
        log
      )
    }, invalidContainerError)
  })

  it('fail to update container with undefined id', async () => {
    await expectReject(async () => {
      await containerService.updateContainer(
        update,
        undefined,
        validUpdateContainerRequest,
        log
      )
    }, invalidContainerIdError)
  })

})
