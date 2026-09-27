import { suite, test } from '../../../test.js'

import {
  referredBeerNotFoundError,
  referredContainerNotFoundError,
  storageNotFoundError,
} from '../../../../src/logic/errors.js'
import type { LockId } from '../../../../src/logic/db.js'
import type { Pagination } from '../../../../src/logic/pagination.js'
import type {
  CreateIf,
  CreateStorageRequest,
  Storage,
  UpdateIf,
} from '../../../../src/logic/storage/storage.js'
import * as storageService from '../../../../src/logic/internal/storage/service.js'

import { dummyLog as log } from '../../dummy-log.js'
import { expectReject } from '../../controller-error-helper.js'
import { assertDeepEqual, assertEqual } from '../../../assert.js'
import {
  buildCreateStorageRequest,
  buildJoinedStorage,
  buildStorage,
  buildStorageWithDate,
} from '../../storage/builders.js'

const createRequest = buildCreateStorageRequest()

const updateRequest = buildStorage()

// The storage as the repository returns it after an insert or an update.
const storage = buildStorageWithDate()

function lockOnly(lockedId: string): LockId {
  return async (id: string): Promise<string | undefined> => {
    assertEqual(id, lockedId)
    return id
  }
}

suite('storage service unit tests', () => {
  test('create storage', async () => {
    const insertStorage = async (newStorage: CreateStorageRequest) => {
      assertDeepEqual(newStorage, createRequest)
      return storage
    }
    let isBeerLocked = false
    let isContainerLocked = false
    const createIf: CreateIf = {
      insertStorage,
      lockBeer: async (beerId: string) => {
        assertEqual(isBeerLocked, false)
        isBeerLocked = true
        return lockOnly(createRequest.beer)(beerId)
      },
      lockContainer: async (containerId: string) => {
        assertEqual(isContainerLocked, false)
        isContainerLocked = true
        return lockOnly(createRequest.container)(containerId)
      },
    }
    const result = await storageService.createStorage(
      createIf,
      createRequest,
      log,
    )
    assertDeepEqual(result, storage)
    assertEqual(isBeerLocked, true)
    assertEqual(isContainerLocked, true)
  })

  test('fail to create storage with invalid beer', async () => {
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
      },
    }
    await expectReject(async () => {
      await storageService.createStorage(createIf, createRequest, log)
    }, referredBeerNotFoundError)
  })

  test('fail to create storage with invalid container', async () => {
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
      },
    }
    await expectReject(async () => {
      await storageService.createStorage(createIf, createRequest, log)
    }, referredContainerNotFoundError)
  })

  test('update storage', async () => {
    let isBeerLocked = false
    let isContainerLocked = false
    const updateStorage = async (updatedStorage: Storage) => {
      assertDeepEqual(updatedStorage, updateRequest)
      return storage
    }
    const updateIf: UpdateIf = {
      updateStorage,
      lockBeer: async (beerId: string) => {
        assertEqual(isBeerLocked, false)
        isBeerLocked = true
        return lockOnly(updateRequest.beer)(beerId)
      },
      lockContainer: async (containerId: string) => {
        assertEqual(isContainerLocked, false)
        isContainerLocked = true
        return lockOnly(updateRequest.container)(containerId)
      },
    }
    const result = await storageService.updateStorage(
      updateIf,
      updateRequest,
      log,
    )
    assertDeepEqual(result, storage)
    assertEqual(isBeerLocked, true)
    assertEqual(isContainerLocked, true)
  })

  test('fail to update storage with invalid beer', async () => {
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
      },
    }
    await expectReject(async () => {
      await storageService.updateStorage(updateIf, updateRequest, log)
    }, referredBeerNotFoundError)
  })

  test('fail to update storage with invalid container', async () => {
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
    await expectReject(async () => {
      await storageService.updateStorage(updateIf, updateRequest, log)
    }, referredContainerNotFoundError)
  })

  test('delete storage', async (t) => {
    const deleter = t.mock.fn(async (_: string): Promise<void> => undefined)
    const id = '18801a29-1c4e-40a4-ab3b-1701b4416c6c'
    await storageService.deleteStorageById(deleter, id, log)
    assertEqual(deleter.mock.callCount(), 1)
    assertDeepEqual(
      deleter.mock.calls[deleter.mock.callCount() - 1].arguments,
      [id],
    )
  })

  test('find storage', async () => {
    const joinedStorage = buildJoinedStorage()
    const finder = async (storageId: string) => {
      assertEqual(storageId, joinedStorage.id)
      return joinedStorage
    }
    const result = await storageService.findStorageById(
      finder,
      joinedStorage.id,
      log,
    )
    assertDeepEqual(result, joinedStorage)
  })

  test('not find storage with unknown id', async () => {
    const id = 'd29b2ee6-5d2e-40bf-bb87-c02c00a6628f'
    const finder = async (searchId: string) => {
      assertEqual(searchId, id)
      return undefined
    }
    await expectReject(async () => {
      await storageService.findStorageById(finder, id, log)
    }, storageNotFoundError(id))
  })

  test('list storages', async () => {
    const pagination: Pagination = {
      size: 10,
      skip: 80,
    }
    const joinedStorage = buildJoinedStorage()
    const lister = async () => {
      return [joinedStorage]
    }
    const result = await storageService.listStorages(lister, pagination, log)
    assertDeepEqual(result, [joinedStorage])
  })

  test('list storages by beer', async () => {
    const beerId = '77d16346-2a56-4b52-9425-1e885b2be7c4'
    const joinedStorage = buildJoinedStorage()
    const lister = async (listBeerId: string) => {
      assertEqual(listBeerId, beerId)
      return [joinedStorage]
    }
    const result = await storageService.listStoragesByBeer(lister, beerId, log)
    assertDeepEqual(result, [joinedStorage])
  })

  test('list storages by brewery', async () => {
    const breweryId = 'cbc84989-ad82-4a46-b9ee-c6be16ef5e46'
    const joinedStorage = buildJoinedStorage()
    const lister = async (listBreweryId: string) => {
      assertEqual(listBreweryId, breweryId)
      return [joinedStorage]
    }
    const result = await storageService.listStoragesByBrewery(
      lister,
      breweryId,
      log,
    )
    assertDeepEqual(result, [joinedStorage])
  })

  test('list storages by style', async () => {
    const styleId = '1c753e76-1231-4ced-8fb0-94c2031283f8'
    const joinedStorage = buildJoinedStorage()
    const lister = async (listStyleId: string) => {
      assertEqual(listStyleId, styleId)
      return [joinedStorage]
    }
    const result = await storageService.listStoragesByStyle(
      lister,
      styleId,
      log,
    )
    assertDeepEqual(result, [joinedStorage])
  })

  test('get annual storage stats', async () => {
    const getter = async () => {
      return [{ year: '2022', count: '8' }]
    }
    const result = await storageService.getAnnualStorageStats(getter, log)
    assertDeepEqual(result, [{ year: '2022', count: '8' }])
  })

  test('get monthly storage stats', async () => {
    const getter = async () => {
      return [{ year: '2022', month: '10', count: '8' }]
    }
    const result = await storageService.getMonthlyStorageStats(getter, log)
    assertDeepEqual(result, [{ year: '2022', month: '10', count: '8' }])
  })
})
