import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'

import * as storageService from '../../../src/core/storage/authorized.service'

import type { AuthTokenPayload } from '../../../src/core/auth/auth-token'
import type {
  JoinedStorage,
  Storage,
  CreateStorageRequest,
  UpdateStorageRequest,
  CreateIf,
  UpdateIf,
  StorageWithDate
} from '../../../src/core/storage/storage'
import { dummyLog as log } from '../dummy-log'
import { expectReject } from '../controller-error-helper'
import {
  invalidStorageError,
  noRightsError
} from '../../../src/core/errors'

const validCreateStorageRequest: CreateStorageRequest = {
  beer: 'd667bdcb-a26e-4079-b249-c50769129c4c',
  bestBefore: '2024-12-12T12:12:12.000Z',
  container: '38209047-93df-4aa6-ae22-1fde02c65edf'
}

const validUpdateStorageRequest: UpdateStorageRequest = {
  beer: 'a3d0fda0-834b-4b8e-9164-822e422d63d0',
  bestBefore: '2024-12-13T12:12:12.000Z',
  container: '688904c8-a66f-4b1a-9b59-b9a2dc86a602'
}

const storage: StorageWithDate = {
  id: 'bf684f7c-e4e1-488b-b2a2-afe363189144',
  beer: 'cb7f08d3-eeb5-43b7-9c9d-d3d308fc5de5',
  bestBefore: new Date('2024-12-11T12:12:12.000Z'),
  container: '4455d3e8-7438-44cb-9b6e-95821c2d1b1e'
}

const invalidStorageRequest = {
  bestBefore: '2024-12-13T12:12:12.000Z',
  container: '10d8409a-6fb2-482e-9439-93a250428607'
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

const adminAuthToken: AuthTokenPayload = {
  userId: '868fa5ed-6a50-4e9d-80ab-b16a496969e4',
  role: 'admin',
  refreshTokenId: 'dd80f30a-7757-4fd4-bee2-2fcc607f6507'
}

const viewerAuthToken: AuthTokenPayload = {
  userId: '90c62eb4-3483-402d-979c-fc684da2c595',
  role: 'viewer',
  refreshTokenId: '5354aaa4-b3d0-45d8-8c81-75d18588b58d'
}

describe('storage authorized service unit tests', () => {
  it('create storage as admin', async () => {
    await storageService.createStorage(createIf, {
      authTokenPayload: adminAuthToken,
      body: validCreateStorageRequest
    }, log)
  })

  it('fail to create storage as viewer', async () => {
    await expectReject(async () => {
      await storageService.createStorage(createIf, {
        authTokenPayload: viewerAuthToken,
        body: validCreateStorageRequest
      }, log)
    }, noRightsError)
  })

  it('fail to create invalid storage as admin', async () => {
    await expectReject(async () => {
      await storageService.createStorage(createIf, {
        authTokenPayload: adminAuthToken,
        body: invalidStorageRequest
      }, log)
    }, invalidStorageError)
  })

  it('update storage as admin', async () => {
    await storageService.updateStorage(updateIf, {
      authTokenPayload: adminAuthToken,
      id: storage.id
    }, validUpdateStorageRequest, log)
  })

  it('fail to update storage as viewer', async () => {
    await expectReject(async () => {
      await storageService.updateStorage(updateIf, {
        authTokenPayload: viewerAuthToken,
        id: storage.id
      }, validUpdateStorageRequest, log)
    }, noRightsError)
  })

  it('fail to update invalid storage as admin', async () => {
    await expectReject(async () => {
      await storageService.updateStorage(updateIf, {
        authTokenPayload: adminAuthToken,
        id: storage.id
      }, invalidStorageRequest, log)
    }, invalidStorageError)
  })

  it('delete storage as admin', async () => {
    await storageService.deleteStorageById(async () => undefined, {
      authTokenPayload: adminAuthToken,
      id: storage.id
    }, log)
  })

  it('fail to delete storage as viewer', async () => {
    await expectReject(async () => {
      await storageService.deleteStorageById(async () => undefined, {
        authTokenPayload: viewerAuthToken,
        id: storage.id
      }, log)
    }, noRightsError)
  })
  ;

  [adminAuthToken, viewerAuthToken].forEach((token: AuthTokenPayload) => {
    const joinedStorage: JoinedStorage = {
      ...storage,
      bestBefore: new Date(storage.bestBefore),
      beerId: storage.beer,
      beerName: 'Weizenbock',
      breweries: [{
        id: 'dd528975-07b6-4e11-b523-5c64986b618f',
        name: 'Koskipanimo'
      }],
      container: {
        id: 'c14851cd-9740-4cdc-8248-e1561d26ff9b',
        size: '0.50',
        type: 'draft'
      },
      createdAt: new Date('2022-12-30T17:15:12.123.Z'),
      hasReview: false,
      styles: [{
        id: 'd3353300-9ccc-4640-940a-5391655a3a73',
        name: 'Weizenbock'
      }]
    }

    it(`find storage as ${token.role}`, async () => {
      const result = await storageService.findStorageById(
        async () => joinedStorage,
        {
          authTokenPayload: token,
          id: storage.id
        },
        log
      )
      assert.deepEqual(result, joinedStorage)
    })

    it(`list storages as ${token.role}`, async () => {
      const result = await storageService.listStorages(
        async () => [joinedStorage],
        token,
        { skip: 0, size: 20 },
        log
      )
      assert.deepEqual(result, [joinedStorage])
    })

    it(`list storages by beer as ${token.role}`, async () => {
      const result = await storageService.listStoragesByBeer(
        async () => [joinedStorage],
        {
          authTokenPayload: token,
          id: joinedStorage.beerId
        },
        log
      )
      assert.deepEqual(result, [joinedStorage])
    })

    it(`list storages by brewery as ${token.role}`, async () => {
      const result = await storageService.listStoragesByBrewery(
        async () => [joinedStorage],
        {
          authTokenPayload: token,
          id: joinedStorage.breweries[0].id
        },
        log
      )
      assert.deepEqual(result, [joinedStorage])
    })

    it(`list storages by style as ${token.role}`, async () => {
      const result = await storageService.listStoragesByStyle(
        async () => [joinedStorage],
        {
          authTokenPayload: token,
          id: joinedStorage.styles[0].id
        },
        log
      )
      assert.deepEqual(result, [joinedStorage])
    })
  })

})
