import { expect } from 'earl'
import type {
  Container,
  CreateContainerRequest,
  NewContainer,
  UpdateContainerRequest,
} from '../../../../src/core/container/container'
import * as containerService from '../../../../src/core/container/internal/service'
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
    const create = async (newContainer: NewContainer) => {
      const result = {
        id: container.id,
        type: container.type,
        size: container.size,
      }
      expect(newContainer).toEqual(
        { type: container.type, size: container.size }
      )
      return result
    }
    const result = await containerService.createContainer(create, request, log)
    expect(result).toEqual({
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
      expect(container).toEqual(result)
      return result
    }
    const result = await containerService.updateContainer(
      update,
      container.id,
      request,
      log
    )
    expect(result).toEqual({
      ...request,
      id: container.id
    })
  })

  it('find container', async () => {
    const finder = async (containerId: string) => {
      expect(containerId).toEqual(container.id)
      return container
    }
    const result = await containerService.findContainerById(
      finder,
      container.id,
      log
    )
    expect(result).toEqual(container)
  })

  it('fail to find container with unknown id', async () => {
    const id = 'd29b2ee6-5d2e-40bf-bb87-c02c00a6628f'
    const finder = async (searchId: string) => {
      expect(searchId).toEqual(id)
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
    expect(result).toEqual([container])
  })

})
