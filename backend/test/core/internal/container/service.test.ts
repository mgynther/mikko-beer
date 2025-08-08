import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'

import type {
  Container,
  CreateContainerRequest,
  UpdateContainerRequest
} from '../../../../src/core/container/container'
import * as containerService from '../../../../src/core/internal/container/service'
import { containerNotFoundError } from '../../../../src/core/errors'

import { dummyLog as log } from '../../dummy-log'
import { expectReject } from '../../controller-error-helper'

const container: Container = {
  id: '1fcbeb9e-1ea1-4c50-8fe5-b0aa18ac7e9a',
  type: 'draft',
  size: '0.1',
}

describe('container service unit tests', () => {
  it('create container', async () => {
    const request: CreateContainerRequest = {
      type: container.type,
      size: container.size,
    }
    const create = async (newContainer: CreateContainerRequest) => {
      const result = {
        id: container.id,
        type: container.type,
        size: container.size,
      }
      assert.deepEqual(newContainer,
        { type: container.type, size: container.size }
      )
      return result
    }
    const result = await containerService.createContainer(create, request, log)
    assert.deepEqual(result, {
      ...request,
      id: container.id
    })
  })

  it('update container', async () => {
    const request: UpdateContainerRequest = {
      type: container.type,
      size: container.size,
    }
    const update = async (container: Container) => {
      const result = {
        id: container.id,
        type: container.type,
        size: container.size,
      }
      assert.deepEqual(container, result)
      return result
    }
    const result = await containerService.updateContainer(
      update,
      container.id,
      request,
      log
    )
    assert.deepEqual(result, {
      ...request,
      id: container.id
    })
  })

  it('find container', async () => {
    const finder = async (containerId: string) => {
      assert.equal(containerId, container.id)
      return container
    }
    const result = await containerService.findContainerById(
      finder,
      container.id,
      log
    )
    assert.deepEqual(result, container)
  })

  it('fail to find container with unknown id', async () => {
    const id = 'd29b2ee6-5d2e-40bf-bb87-c02c00a6628f'
    const finder = async (searchId: string) => {
      assert.equal(searchId, id)
      return undefined
    }
    expectReject(async () => {
      await containerService.findContainerById(finder, id, log)
    }, containerNotFoundError(id))
  })

  it('list containers', async () => {
    const lister = async () => {
      return [container]
    }
    const result = await containerService.listContainers(lister, log)
    assert.deepEqual(result, [container])
  })

})
