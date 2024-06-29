import { expect } from 'chai'
import {
  type Container,
  type CreateContainerRequest,
  type UpdateContainerRequest,
  type NewContainer
} from '../../../src/core/container/container'
import * as containerService from '../../../src/core/container/container.service'

import { dummyLog as log } from '../dummy-log'

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
      expect(newContainer).to.eql(
        { type: container.type, size: container.size }
      )
      return result
    }
    const result = await containerService.createContainer(create, request, log)
    expect(result).to.eql({
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
      expect(container).to.eql(result)
      return result
    }
    const result = await containerService.updateContainer(
      update,
      container.id,
      request,
      log
    )
    expect(result).to.eql({
      ...request,
      id: container.id
    })
  })

  it('find container', async () => {
    const finder = async (containerId: string) => {
      expect(containerId).to.equal(container.id)
      return container
    }
    const result = await containerService.findContainerById(
      finder,
      container.id,
      log
    )
    expect(result).to.eql(container)
  })

  it('fail to find container with unknown id', async () => {
    const id = 'd29b2ee6-5d2e-40bf-bb87-c02c00a6628f'
    const finder = async (searchId: string) => {
      expect(searchId).to.equal(id)
      return undefined
    }
    const result = await containerService.findContainerById(finder, id, log)
    expect(result).to.eql(undefined)
  })

  it('list containers', async () => {
    const lister = async () => {
      return [container]
    }
    const result = await containerService.listContainers(lister, log)
    expect(result).to.eql([container])
  })

})
