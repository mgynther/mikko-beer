import { expect } from 'chai'

import { type Pagination } from '../../../src/core/pagination'
import {
  type Storage,
  type CreateStorageRequest,
  type JoinedStorage,
} from '../../../src/core/storage/storage'
import * as storageService from '../../../src/core/storage/storage.service'

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

describe('storage service unit tests', () => {
  it('should create storage', async () => {
    const request: CreateStorageRequest = {
      beer: storage.beer,
      bestBefore: storage.bestBefore,
      container: storage.container,
    }
    const create = async (newStorage: CreateStorageRequest) => {
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
    const result = await storageService.createStorage(create, request, log)
    expect(result).to.eql({
      ...request,
      id: storage.id
    })
  })

  it('should update storage', async () => {
    const request: Storage = {
      ...storage,
    }
    const update = async (storage: Storage) => {
      const result = {
        id: storage.id,
        beer: storage.beer,
        bestBefore: storage.bestBefore,
        container: storage.container,
      }
      expect(storage).to.eql(result)
      return result
    }
    const result = await storageService.updateStorage(update, request, log)
    expect(result).to.eql({
      ...request,
      id: storage.id
    })
  })

  it('should find storage', async () => {
    const finder = async (storageId: string) => {
      expect(storageId).to.equal(joinedStorage.id)
      return joinedStorage
    }
    const result = await storageService.findStorageById(finder, storage.id, log)
    expect(result).to.eql(joinedStorage)
  })

  it('should not find storage with unknown id', async () => {
    const id = 'd29b2ee6-5d2e-40bf-bb87-c02c00a6628f'
    const finder = async (searchId: string) => {
      expect(searchId).to.equal(id)
      return undefined
    }
    const result = await storageService.findStorageById(finder, id, log)
    expect(result).to.eql(undefined)
  })

  it('should list storages', async () => {
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

  it('should list storages by beer', async () => {
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

  it('should list storages by brewery', async () => {
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

  it('should list storages by style', async () => {
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
