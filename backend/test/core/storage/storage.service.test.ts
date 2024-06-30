import { expect } from 'chai'

import {
  referredBeerNotFoundError,
  referredContainerNotFoundError,
  storageNotFoundError
} from '../../../src/core/errors'
import { type Pagination } from '../../../src/core/pagination'
import {
  type Storage,
  type CreateStorageRequest,
  type JoinedStorage,
} from '../../../src/core/storage/storage'
import * as storageService from '../../../src/core/storage/storage.service'
import {
  type CreateIf,
  type UpdateIf
} from '../../../src/core/storage/storage.service'

import { dummyLog as log } from '../dummy-log'

const storage: Storage = {
  id: '8980b34a-d7b7-4e15-8e88-477176f5aee9',
  beer: '77d16346-2a56-4b52-9425-1e885b2be7c4',
  bestBefore: new Date('2024-03-29T12:21:09.123Z'),
  container: 'c44ba7c6-80d2-4564-93ba-a84b020511ca',
}

const joinedStorage: JoinedStorage = {
  id: storage.id,
  beerId: storage.beer,
  beerName: 'Severin',
  bestBefore: storage.bestBefore,
  breweries: [{
    id: 'cbc84989-ad82-4a46-b9ee-c6be16ef5e46',
    name: 'Koskipanimo',
  }],
  container: {
    id: storage.container,
    type: 'draft',
    size: '0.10',
  },
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
  expect(beerId).to.eql(storage.beer)
  return storage.beer
}

const lockContainer = async (
  containerId: string
): Promise<string | undefined> => {
  expect(containerId).to.eql(storage.container)
  return storage.container
}

function notCalled() {
  expect('must not be called').to.equal(true)
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
      expect(newStorage).to.eql(
        {
          beer: storage.beer,
          bestBefore: storage.bestBefore,
          container: storage.container,
        }
      )
      return result
    }
    let isBeerLocked = false
    let isContainerLocked = false
    const createIf: CreateIf = {
      insertStorage,
      lockBeer: async (beerId: string) => {
        expect(isBeerLocked).to.equal(false)
        isBeerLocked = true
        return lockBeer(beerId)
      },
      lockContainer: async (containerId: string) => {
        expect(isContainerLocked).to.equal(false)
        isContainerLocked = true
        return lockContainer(containerId)
      }
    }
    const result = await storageService.createStorage(
      createIf,
      createRequest,
      log
    )
    expect(result).to.eql({
      ...createRequest,
      id: storage.id
    })
    expect(isBeerLocked).to.equal(true)
    expect(isContainerLocked).to.equal(true)
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
    try {
      await storageService.createStorage(createIf, createRequest, log)
      notCalled()
    } catch (e) {
      expect(e).to.eql(referredBeerNotFoundError)
    }
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
    try {
      await storageService.createStorage(createIf, createRequest, log)
      notCalled()
    } catch (e) {
      expect(e).to.eql(referredContainerNotFoundError)
    }
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
      expect(storage).to.eql(result)
      return result
    }
    const updateIf: UpdateIf = {
      updateStorage,
      lockBeer: async (beerId: string) => {
        expect(isBeerLocked).to.equal(false)
        isBeerLocked = true
        return lockBeer(beerId)
      },
      lockContainer: async (containerId: string) => {
        expect(isContainerLocked).to.equal(false)
        isContainerLocked = true
        return lockContainer(containerId)
      }
    }
    const result = await storageService.updateStorage(
      updateIf,
      updateRequest,
      log
    )
    expect(result).to.eql({
      ...updateRequest,
      id: storage.id
    })
    expect(isBeerLocked).to.equal(true)
    expect(isContainerLocked).to.equal(true)
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
    try {
      await storageService.updateStorage(updateIf, updateRequest, log)
      notCalled()
    } catch (e) {
      expect(e).to.eql(referredBeerNotFoundError)
    }
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
    try {
      await storageService.updateStorage(updateIf, updateRequest, log)
      notCalled()
    } catch (e) {
      expect(e).to.equal(referredContainerNotFoundError)
    }
  })

  it('find storage', async () => {
    const finder = async (storageId: string) => {
      expect(storageId).to.equal(joinedStorage.id)
      return joinedStorage
    }
    const result = await storageService.findStorageById(finder, storage.id, log)
    expect(result).to.eql(joinedStorage)
  })

  it('not find storage with unknown id', async () => {
    const id = 'd29b2ee6-5d2e-40bf-bb87-c02c00a6628f'
    const finder = async (searchId: string) => {
      expect(searchId).to.equal(id)
      return undefined
    }
    try {
    await storageService.findStorageById(finder, id, log)
    } catch (e) {
      expect(e).to.eql(storageNotFoundError(id))
    }
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
    expect(result).to.eql([joinedStorage])
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
    expect(result).to.eql([joinedStorage])
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
    expect(result).to.eql([joinedStorage])
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
    expect(result).to.eql([joinedStorage])
  })

})
