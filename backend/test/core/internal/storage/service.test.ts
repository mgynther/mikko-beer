import { expect, mockFn } from 'earl'

import {
  referredBeerNotFoundError,
  referredContainerNotFoundError,
  storageNotFoundError
} from '../../../../src/core/errors'
import type { Pagination } from '../../../../src/core/pagination'
import type {
  CreateIf,
  CreateStorageRequest,
  JoinedStorage,
  Storage,
  UpdateIf
} from '../../../../src/core/storage'
import * as storageService from '../../../../src/core/internal/storage/service'

import { dummyLog as log } from '../../dummy-log'
import { expectReject } from '../../controller-error-helper'

const storage: Storage = {
  id: '8980b34a-d7b7-4e15-8e88-477176f5aee9',
  beer: '77d16346-2a56-4b52-9425-1e885b2be7c4',
  bestBefore: '2024-03-29T12:21:09.123Z',
  container: 'c44ba7c6-80d2-4564-93ba-a84b020511ca',
}

const joinedStorage: JoinedStorage = {
  id: storage.id,
  beerId: storage.beer,
  beerName: 'Severin',
  bestBefore: new Date(storage.bestBefore),
  breweries: [{
    id: 'cbc84989-ad82-4a46-b9ee-c6be16ef5e46',
    name: 'Koskipanimo',
  }],
  container: {
    id: storage.container,
    type: 'draft',
    size: '0.10',
  },
  createdAt: new Date('2021-02-03T11:12:13.456Z'),
  hasReview: true,
  styles: [{
    id: '1c753e76-1231-4ced-8fb0-94c2031283f8',
    name: 'IPA',
  }],
}

const createRequest: CreateStorageRequest = {
  beer: storage.beer,
  bestBefore: storage.bestBefore,
  container: storage.container,
}

const updateRequest: Storage = {
  ...storage,
}

const lockBeer = async (
  beerId: string
): Promise<string | undefined> => {
  expect(beerId).toEqual(storage.beer)
  return storage.beer
}

const lockContainer = async (
  containerId: string
): Promise<string | undefined> => {
  expect(containerId).toEqual(storage.container)
  return storage.container
}

describe('storage service unit tests', () => {
  it('create storage', async () => {
    const insertStorage = async (newStorage: CreateStorageRequest) => {
      const result = {
        id: storage.id,
        beer: storage.beer,
        bestBefore: storage.bestBefore,
        container: storage.container,
      }
      expect(newStorage).toEqual(
        {
          beer: storage.beer,
          bestBefore: storage.bestBefore,
          container: storage.container,
        }
      )
      return {
        ...result,
        bestBefore: new Date(result.bestBefore)
      }
    }
    let isBeerLocked = false
    let isContainerLocked = false
    const createIf: CreateIf = {
      insertStorage,
      lockBeer: async (beerId: string) => {
        expect(isBeerLocked).toEqual(false)
        isBeerLocked = true
        return lockBeer(beerId)
      },
      lockContainer: async (containerId: string) => {
        expect(isContainerLocked).toEqual(false)
        isContainerLocked = true
        return lockContainer(containerId)
      }
    }
    const result = await storageService.createStorage(
      createIf,
      createRequest,
      log
    )
    expect(result).toEqual({
      ...createRequest,
      bestBefore: new Date(createRequest.bestBefore),
      id: storage.id
    })
    expect(isBeerLocked).toEqual(true)
    expect(isContainerLocked).toEqual(true)
  })

  it('fail to create storage with invalid beer', async () => {
    const insertStorage = async () => {
      throw new Error('must not be called')
    }
    const createIf: CreateIf = {
      insertStorage,
      lockBeer: async () => {
        return undefined
      },
      lockContainer: async (id: string) => {
        return id
      }
    }
    expectReject(async () => {
      await storageService.createStorage(createIf, createRequest, log)
    }, referredBeerNotFoundError)
  })

  it('fail to create storage with invalid container', async () => {
    const insertStorage = async () => {
      throw new Error('must not be called')
    }
    const createIf: CreateIf = {
      insertStorage,
      lockBeer: async (id: string) => {
        return id
      },
      lockContainer: async () => {
        return undefined
      }
    }
    expectReject(async () => {
      await storageService.createStorage(createIf, createRequest, log)
    }, referredContainerNotFoundError)
  })

  it('update storage', async () => {
    let isBeerLocked = false
    let isContainerLocked = false
    const updateStorage = async (storage: Storage) => {
      const result = {
        id: storage.id,
        beer: storage.beer,
        bestBefore: storage.bestBefore,
        container: storage.container,
      }
      expect(storage).toEqual(result)
      return {
        ...result,
        bestBefore: new Date(result.bestBefore)
      }
    }
    const updateIf: UpdateIf = {
      updateStorage,
      lockBeer: async (beerId: string) => {
        expect(isBeerLocked).toEqual(false)
        isBeerLocked = true
        return lockBeer(beerId)
      },
      lockContainer: async (containerId: string) => {
        expect(isContainerLocked).toEqual(false)
        isContainerLocked = true
        return lockContainer(containerId)
      }
    }
    const result = await storageService.updateStorage(
      updateIf,
      updateRequest,
      log
    )
    expect(result).toEqual({
      ...updateRequest,
      bestBefore: new Date(updateRequest.bestBefore),
      id: storage.id
    })
    expect(isBeerLocked).toEqual(true)
    expect(isContainerLocked).toEqual(true)
  })

  it('fail to update storage with invalid beer', async () => {
    const updateStorage = async () => {
      throw new Error('must not be called')
    }
    const updateIf: UpdateIf = {
      updateStorage,
      lockBeer: async () => {
        return undefined
      },
      lockContainer: async (id: string) => {
        return id
      }
    }
    expectReject(async () => {
      await storageService.updateStorage(updateIf, updateRequest, log)
    }, referredBeerNotFoundError)
  })

  it('fail to update storage with invalid container', async () => {
    const updateStorage = async () => {
      throw new Error('must not be called')
    }
    const updateIf: UpdateIf = {
      updateStorage,
      lockBeer: async (id: string) => {
        return id
      },
      lockContainer: async () => {
        return undefined
      },
    }
    expectReject(async () => {
      await storageService.updateStorage(updateIf, updateRequest, log)
    }, referredContainerNotFoundError)
  })

  it('delete storage', async () => {
    const deleter = mockFn(async (id: string) => {
      id
    })
    const id = '18801a29-1c4e-40a4-ab3b-1701b4416c6c'
    await storageService.deleteStorageById(deleter, id, log)
    expect(deleter).toHaveBeenCalledTimes(1)
    expect(deleter).toHaveBeenLastCalledWith(id)
  })

  it('find storage', async () => {
    const finder = async (storageId: string) => {
      expect(storageId).toEqual(joinedStorage.id)
      return joinedStorage
    }
    const result = await storageService.findStorageById(finder, storage.id, log)
    expect(result).toEqual(joinedStorage)
  })

  it('not find storage with unknown id', async () => {
    const id = 'd29b2ee6-5d2e-40bf-bb87-c02c00a6628f'
    const finder = async (searchId: string) => {
      expect(searchId).toEqual(id)
      return undefined
    }
    expectReject(async () => {
      await storageService.findStorageById(finder, id, log)
    }, storageNotFoundError(id))
  })

  it('list storages', async () => {
    const pagination: Pagination = {
      size: 10,
      skip: 80
    }
    const lister = async () => {
      return [joinedStorage]
    }
    const result = await storageService.listStorages(lister, pagination, log)
    expect(result).toEqual([joinedStorage])
  })

  it('list storages by beer', async () => {
    const lister = async () => {
      return [joinedStorage]
    }
    const result = await storageService.listStoragesByBeer(
      lister,
      joinedStorage.beerId,
      log
    )
    expect(result).toEqual([joinedStorage])
  })

  it('list storages by brewery', async () => {
    const lister = async () => {
      return [joinedStorage]
    }
    const result = await storageService.listStoragesByBeer(
      lister,
      joinedStorage.breweries[0].id,
      log
    )
    expect(result).toEqual([joinedStorage])
  })

  it('list storages by style', async () => {
    const lister = async () => {
      return [joinedStorage]
    }
    const result = await storageService.listStoragesByStyle(
      lister,
      joinedStorage.styles[0].id,
      log
    )
    expect(result).toEqual([joinedStorage])
  })

})
