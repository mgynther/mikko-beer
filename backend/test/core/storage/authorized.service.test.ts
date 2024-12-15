import * as storageService from '../../../src/core/storage/authorized.service'

import type { AuthTokenPayload } from '../../../src/core/auth/auth-token'
import type {
  Storage,
  CreateStorageRequest,
  UpdateStorageRequest,
  CreateIf,
  UpdateIf,
  StorageWithDate
} from '../../../src/core/storage/storage'
import { Role } from '../../../src/core/user/user'
import { dummyLog as log } from '../dummy-log'
import { expectReject } from '../controller-error-helper'
import {
  ControllerError,
  invalidStorageError,
  invalidStorageIdError,
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
  role: Role.admin,
  refreshTokenId: 'dd80f30a-7757-4fd4-bee2-2fcc607f6507'
}

const viewerAuthToken: AuthTokenPayload = {
  userId: '90c62eb4-3483-402d-979c-fc684da2c595',
  role: Role.viewer,
  refreshTokenId: '5354aaa4-b3d0-45d8-8c81-75d18588b58d'
}

interface CreateRejectionTest {
  token: AuthTokenPayload
  body: unknown
  error: ControllerError
  title: string
}

const createRejectionTests: CreateRejectionTest[] = [
  {
    token: viewerAuthToken,
    body: validCreateStorageRequest,
    error: noRightsError,
    title: 'fail to create storage as viewer'
  },
  {
    token: viewerAuthToken,
    body: invalidStorageRequest,
    error: noRightsError,
    title: 'fail to create invalid storage as viewer'
  },
  {
    token: adminAuthToken,
    body: invalidStorageRequest,
    error: invalidStorageError,
    title: 'fail to create invalid storage as admin'
  }
]

interface UpdateRejectionTest {
  token: AuthTokenPayload
  body: unknown
  storageId: string | undefined
  error: ControllerError
  title: string
}

const updateRejectionTests: UpdateRejectionTest[] = [
  {
    token: viewerAuthToken,
    body: validUpdateStorageRequest,
    storageId: storage.id,
    error: noRightsError,
    title: 'fail to update storage as viewer'
  },
  {
    token: viewerAuthToken,
    body: invalidStorageRequest,
    storageId: storage.id,
    error: noRightsError,
    title: 'fail to update invalid storage as viewer'
  },
  {
    token: viewerAuthToken,
    body: validUpdateStorageRequest,
    storageId: undefined,
    error: noRightsError,
    title: 'fail to update storage with undefined id as viewer'
  },
  {
    token: adminAuthToken,
    body: invalidStorageRequest,
    storageId: storage.id,
    error: invalidStorageError,
    title: 'fail to update invalid storage as admin'
  },
  {
    token: adminAuthToken,
    body: validUpdateStorageRequest,
    storageId: undefined,
    error: invalidStorageIdError,
    title: 'fail to update storage with undefined id as admin'
  },
]

describe('storage authorized service unit tests', () => {
  it('create storage as admin', async () => {
    await storageService.createStorage(createIf, {
      authTokenPayload: adminAuthToken,
      body: validCreateStorageRequest
    }, log)
  })

  createRejectionTests.forEach(testCase => {
    it(testCase.title, async () => {
      await expectReject(async () => {
        await storageService.createStorage(createIf, {
          authTokenPayload: testCase.token,
          body: testCase.body
        }, log)
      }, testCase.error)
    })
  })

  it('update storage as admin', async () => {
    await storageService.updateStorage(updateIf, {
      authTokenPayload: adminAuthToken,
      id: storage.id
    }, validUpdateStorageRequest, log)
  })

  updateRejectionTests.forEach(testCase => {
    it(testCase.title, async () => {
      await expectReject(async () => {
        await storageService.updateStorage(updateIf, {
          authTokenPayload: testCase.token,
          id: testCase.storageId
        }, testCase.body, log)
      }, testCase.error)
    })
  })
})
