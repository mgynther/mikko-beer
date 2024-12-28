import * as storageService from '../../../../src/core/internal/storage/validated.service'

import type {
  Storage,
  CreateStorageRequest,
  UpdateStorageRequest,
  CreateIf,
  UpdateIf,
  StorageWithDate
} from '../../../../src/core/storage'
import { dummyLog as log } from '../../dummy-log'
import { expectReject } from '../../controller-error-helper'
import {
  invalidStorageError,
  invalidStorageIdError
} from '../../../../src/core/errors'

const validCreateStorageRequest: CreateStorageRequest = {
  beer: '9fda06b4-ddda-428b-965c-cfa16f77c010',
  bestBefore: '2024-12-12T12:12:12.000Z',
  container: '2ea4c01b-0f86-4331-8a5b-807abb662385'
}

const validUpdateStorageRequest: UpdateStorageRequest = {
  beer: '00707241-77e7-455a-bd24-bddd76836c1f',
  bestBefore: '2024-12-13T12:12:12.000Z',
  container: 'e5a2d533-5886-4bdd-883a-46a14cb51d87'
}

const storage: StorageWithDate = {
  id: 'c3959cec-9a26-4e03-87b9-4325fe01d3c1',
  beer: 'd5af5383-381c-4e58-8745-76c06ec00449',
  bestBefore: new Date('2024-12-11T12:12:12.000Z'),
  container: '5d9bb066-bbf2-4102-beba-66dbecfd10ce'
}

const invalidStorageRequest = {
  bestBefore: '2024-12-13T12:12:12.000Z',
  container: '3a785635-e43d-48b7-a4e0-9b17c3c31260'
}

const create: (
  storage: CreateStorageRequest
) => Promise<StorageWithDate> = async () => storage
const update: (
  storage: Storage
) => Promise<StorageWithDate> = async () => storage

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

describe('storage authorized service unit tests', () => {
  it('create storage', async () => {
    await storageService.createStorage(createIf, validCreateStorageRequest, log)
  })

  it('fail to create invalid storage', async () => {
    await expectReject(async () => {
      await storageService.createStorage(createIf, invalidStorageRequest, log)
    }, invalidStorageError)
  })

  it('update storage', async () => {
    await storageService.updateStorage(
      updateIf,
      storage.id,
      validUpdateStorageRequest,
      log
    )
  })

  it('fail to update invalid storage', async () => {
    await expectReject(async () => {
      await storageService.updateStorage(
        updateIf,
        storage.id,
        invalidStorageRequest,
        log
      )
    }, invalidStorageError)
  })

  it('fail to update storage with undefined id', async () => {
    await expectReject(async () => {
      await storageService.updateStorage(
        updateIf,
        undefined,
        validUpdateStorageRequest,
        log
      )
    }, invalidStorageIdError)
  })

})
