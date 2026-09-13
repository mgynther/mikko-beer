import { describe, it } from 'node:test'

import * as storageService from '../../../../src/logic/internal/storage/validated.service.js'

import type {
  Storage,
  CreateStorageRequest,
  JoinedStorage,
  UpdateStorageRequest,
  CreateIf,
  UpdateIf,
  StorageWithDate,
  ValidateCreateStorage,
  ValidateStorageId,
  ValidateUpdateStorage,
} from '../../../../src/logic/storage/storage.js'
import { dummyLog as log } from '../../dummy-log.js'
import { expectReject } from '../../controller-error-helper.js'
import {
  invalidBeerIdError,
  invalidBreweryIdError,
  invalidStorageError,
  invalidStorageIdError,
  invalidStyleIdError,
} from '../../../../src/logic/errors.js'
import { assertDeepEqual, assertEqual } from '../../../assert.js'

const validCreateStorageRequest: CreateStorageRequest = {
  beer: '9fda06b4-ddda-428b-965c-cfa16f77c010',
  bestBefore: '2024-12-12T12:12:12.000Z',
  container: '2ea4c01b-0f86-4331-8a5b-807abb662385',
}

const validUpdateStorageRequest: UpdateStorageRequest = {
  beer: '00707241-77e7-455a-bd24-bddd76836c1f',
  bestBefore: '2024-12-13T12:12:12.000Z',
  container: 'e5a2d533-5886-4bdd-883a-46a14cb51d87',
}

const storage: StorageWithDate = {
  id: 'c3959cec-9a26-4e03-87b9-4325fe01d3c1',
  beer: 'd5af5383-381c-4e58-8745-76c06ec00449',
  bestBefore: new Date('2024-12-11T12:12:12.000Z'),
  container: '5d9bb066-bbf2-4102-beba-66dbecfd10ce',
}

const invalidStorageRequest = {
  bestBefore: '2024-12-13T12:12:12.000Z',
  container: '3a785635-e43d-48b7-a4e0-9b17c3c31260',
}

const create: (
  storage: CreateStorageRequest,
) => Promise<StorageWithDate> = async () => storage
const update: (storage: Storage) => Promise<StorageWithDate> = async () =>
  storage

const createIf: CreateIf = {
  insertStorage: create,
  lockBeer: async () => storage.beer,
  lockContainer: async () => storage.container,
}

const updateIf: UpdateIf = {
  updateStorage: update,
  lockBeer: async () => storage.beer,
  lockContainer: async () => storage.container,
}

const passCreateValidation: ValidateCreateStorage = (input: unknown) => {
  assertDeepEqual(input, validCreateStorageRequest)
  return {
    errorCode: undefined,
    result: validCreateStorageRequest,
  }
}

const failCreateValidation: ValidateCreateStorage = () => {
  return {
    errorCode: 'invalid-storage',
    result: undefined,
  }
}

const passUpdateValidation: ValidateUpdateStorage = (
  input: unknown,
  id: string | undefined,
) => {
  assertDeepEqual(input, validUpdateStorageRequest)
  assertEqual(id, storage.id)
  return {
    errorCode: undefined,
    result: {
      id: storage.id,
      request: validUpdateStorageRequest,
    },
  }
}

const failUpdateValidationWithStorage: ValidateUpdateStorage = () => {
  return {
    errorCode: 'invalid-storage',
    result: undefined,
  }
}

const failUpdateValidationWithId: ValidateUpdateStorage = () => {
  return {
    errorCode: 'invalid-storage-id',
    result: undefined,
  }
}

const passStorageIdValidation: ValidateStorageId = (
  id: string | undefined,
) => ({
  errorCode: undefined,
  result: id ?? '',
})

const failStorageIdValidation: ValidateStorageId = () => ({
  errorCode: 'invalid-storage-id',
  result: undefined,
})

describe('storage validated service unit tests', () => {
  it('create storage', async () => {
    await storageService.createStorage(
      createIf,
      passCreateValidation,
      validCreateStorageRequest,
      log,
    )
  })

  it('fail to create invalid storage', async () => {
    await expectReject(async () => {
      await storageService.createStorage(
        createIf,
        failCreateValidation,
        invalidStorageRequest,
        log,
      )
    }, invalidStorageError)
  })

  it('update storage', async () => {
    await storageService.updateStorage(
      updateIf,
      passUpdateValidation,
      storage.id,
      validUpdateStorageRequest,
      log,
    )
  })

  it('fail to update storage with invalid storage', async () => {
    await expectReject(async () => {
      await storageService.updateStorage(
        updateIf,
        failUpdateValidationWithStorage,
        storage.id,
        invalidStorageRequest,
        log,
      )
    }, invalidStorageError)
  })

  it('fail to update storage with undefined id', async () => {
    await expectReject(async () => {
      await storageService.updateStorage(
        updateIf,
        failUpdateValidationWithId,
        undefined,
        validUpdateStorageRequest,
        log,
      )
    }, invalidStorageIdError)
  })

  function notCalled(): any {
    throw new Error('not to be called')
  }

  it('delete storage by id', async () => {
    await storageService.deleteStorageById(
      async () => undefined,
      passStorageIdValidation,
      storage.id,
      log,
    )
  })

  it('fail to delete storage by invalid id', async () => {
    await expectReject(async () => {
      await storageService.deleteStorageById(
        notCalled,
        failStorageIdValidation,
        undefined,
        log,
      )
    }, invalidStorageIdError)
  })

  it('find storage by id', async () => {
    const joinedStorage: JoinedStorage = {
      id: storage.id,
      beerId: storage.beer,
      beerName: 'Severin',
      bestBefore: storage.bestBefore,
      breweries: [],
      container: {
        id: storage.container,
        type: 'bottle',
        size: '0.33',
      },
      createdAt: new Date('2024-12-10T12:12:12.000Z'),
      hasReview: false,
      styles: [],
    }
    const result = await storageService.findStorageById(
      async () => joinedStorage,
      passStorageIdValidation,
      storage.id,
      log,
    )
    assertDeepEqual(result, joinedStorage)
  })

  it('fail to find storage by invalid id', async () => {
    await expectReject(async () => {
      await storageService.findStorageById(
        notCalled,
        failStorageIdValidation,
        undefined,
        log,
      )
    }, invalidStorageIdError)
  })

  it('list storages by beer', async () => {
    const beerId = 'bb1b78f9-3f4f-4a2b-8d3e-2b1a6d4c7f5e'
    const joinedStorages: JoinedStorage[] = []
    const result = await storageService.listStoragesByBeer(
      async () => joinedStorages,
      () => ({ errorCode: undefined, result: beerId }),
      beerId,
      log,
    )
    assertDeepEqual(result, joinedStorages)
  })

  it('fail to list storages by invalid beer id', async () => {
    await expectReject(async () => {
      await storageService.listStoragesByBeer(
        notCalled,
        () => ({ errorCode: 'invalid-beer-id', result: undefined }),
        undefined,
        log,
      )
    }, invalidBeerIdError)
  })

  it('list storages by brewery', async () => {
    const breweryId = 'd1e6e30f-1b1e-4a01-9f54-0b2d1b9b6c2f'
    const joinedStorages: JoinedStorage[] = []
    const result = await storageService.listStoragesByBrewery(
      async () => joinedStorages,
      () => ({ errorCode: undefined, result: breweryId }),
      breweryId,
      log,
    )
    assertDeepEqual(result, joinedStorages)
  })

  it('fail to list storages by invalid brewery id', async () => {
    await expectReject(async () => {
      await storageService.listStoragesByBrewery(
        notCalled,
        () => ({ errorCode: 'invalid-brewery-id', result: undefined }),
        undefined,
        log,
      )
    }, invalidBreweryIdError)
  })

  it('list storages by style', async () => {
    const styleId = '0e2ba1b7-2fb1-4de8-9ba8-3dc5b9e5b9a3'
    const joinedStorages: JoinedStorage[] = []
    const result = await storageService.listStoragesByStyle(
      async () => joinedStorages,
      () => ({ errorCode: undefined, result: styleId }),
      styleId,
      log,
    )
    assertDeepEqual(result, joinedStorages)
  })

  it('fail to list storages by invalid style id', async () => {
    await expectReject(async () => {
      await storageService.listStoragesByStyle(
        notCalled,
        () => ({ errorCode: 'invalid-style-id', result: undefined }),
        undefined,
        log,
      )
    }, invalidStyleIdError)
  })

  it('get annual storage stats', async () => {
    const getter = async () => {
      return [{ year: '2022', count: '8' }]
    }
    await storageService.getAnnualStorageStats(getter, log)
  })

  it('get monthly storage stats', async () => {
    const getter = async () => {
      return [{ year: '2022', month: '10', count: '8' }]
    }
    await storageService.getMonthlyStorageStats(getter, log)
  })
})
