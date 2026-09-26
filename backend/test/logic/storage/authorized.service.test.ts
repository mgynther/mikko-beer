import { describe, it } from 'node:test'

import * as storageService from '../../../src/logic/storage/authorized.service.js'

import type { AuthTokenPayload } from '../../../src/logic/auth/auth-token.js'
import type {
  Storage,
  CreateStorageRequest,
  CreateIf,
  UpdateIf,
  StorageWithDate,
} from '../../../src/logic/storage/storage.js'
import { dummyLog as log } from '../dummy-log.js'
import { expectReject } from '../controller-error-helper.js'
import {
  invalidStorageError,
  noRightsError,
} from '../../../src/logic/errors.js'
import { assertDeepEqual } from '../../assert.js'
import { buildAuthTokenPayload } from '../auth/builders.js'
import {
  buildCreateStorageRequest,
  buildJoinedStorage,
  buildStorageWithDate,
  buildUpdateStorageRequest,
} from './builders.js'

const validCreateStorageRequest = buildCreateStorageRequest()

const validUpdateStorageRequest = buildUpdateStorageRequest()

const storage = buildStorageWithDate()

const invalidStorageRequest = {
  bestBefore: '2024-12-13T12:12:12.000Z',
  container: '10d8409a-6fb2-482e-9439-93a250428607',
}

const create: (
  storage: CreateStorageRequest,
) => Promise<StorageWithDate> = async () => storage
const update: (storage: Storage) => Promise<StorageWithDate> = async () =>
  storage

// Every beer and container a request refers to exists.
const createIf: CreateIf = {
  insertStorage: create,
  lockBeer: async (id: string) => id,
  lockContainer: async (id: string) => id,
}

const updateIf: UpdateIf = {
  updateStorage: update,
  lockBeer: async (id: string) => id,
  lockContainer: async (id: string) => id,
}

const adminAuthToken = buildAuthTokenPayload({ role: 'admin' })

const viewerAuthToken = buildAuthTokenPayload({ role: 'viewer' })

describe('storage authorized service unit tests', () => {
  function notCalled(): any {
    throw new Error('not to be called')
  }

  const passStorageIdValidation = (id: string | undefined) =>
    ({ errorCode: undefined, result: id ?? '' }) as const

  it('create storage as admin', async () => {
    await storageService.createStorage(
      createIf,
      () => ({ errorCode: undefined, result: validCreateStorageRequest }),
      {
        authTokenPayload: adminAuthToken,
        body: validCreateStorageRequest,
      },
      log,
    )
  })

  it('fail to create storage as viewer', async () => {
    await expectReject(async () => {
      await storageService.createStorage(
        createIf,
        notCalled,
        {
          authTokenPayload: viewerAuthToken,
          body: validCreateStorageRequest,
        },
        log,
      )
    }, noRightsError)
  })

  it('fail to create invalid storage as admin', async () => {
    await expectReject(async () => {
      await storageService.createStorage(
        createIf,
        () => ({ errorCode: 'invalid-storage', result: undefined }),
        {
          authTokenPayload: adminAuthToken,
          body: invalidStorageRequest,
        },
        log,
      )
    }, invalidStorageError)
  })

  it('update storage as admin', async () => {
    await storageService.updateStorage(
      updateIf,
      () => ({
        errorCode: undefined,
        result: { id: storage.id, request: validUpdateStorageRequest },
      }),
      {
        authTokenPayload: adminAuthToken,
        id: storage.id,
      },
      validUpdateStorageRequest,
      log,
    )
  })

  it('fail to update storage as viewer', async () => {
    await expectReject(async () => {
      await storageService.updateStorage(
        updateIf,
        notCalled,
        {
          authTokenPayload: viewerAuthToken,
          id: storage.id,
        },
        validUpdateStorageRequest,
        log,
      )
    }, noRightsError)
  })

  it('fail to update invalid storage as admin', async () => {
    await expectReject(async () => {
      await storageService.updateStorage(
        updateIf,
        () => ({ errorCode: 'invalid-storage', result: undefined }),
        {
          authTokenPayload: adminAuthToken,
          id: storage.id,
        },
        invalidStorageRequest,
        log,
      )
    }, invalidStorageError)
  })

  it('delete storage as admin', async () => {
    await storageService.deleteStorageById(
      async () => undefined,
      passStorageIdValidation,
      {
        authTokenPayload: adminAuthToken,
        id: storage.id,
      },
      log,
    )
  })

  it('fail to delete storage as viewer', async () => {
    await expectReject(async () => {
      await storageService.deleteStorageById(
        notCalled,
        notCalled,
        {
          authTokenPayload: viewerAuthToken,
          id: storage.id,
        },
        log,
      )
    }, noRightsError)
  })
  ;[adminAuthToken, viewerAuthToken].forEach((token: AuthTokenPayload) => {
    const joinedStorage = buildJoinedStorage()

    it(`find storage as ${token.role}`, async () => {
      const result = await storageService.findStorageById(
        async () => joinedStorage,
        passStorageIdValidation,
        {
          authTokenPayload: token,
          id: joinedStorage.id,
        },
        log,
      )
      assertDeepEqual(result, joinedStorage)
    })

    it(`list storages as ${token.role}`, async () => {
      const result = await storageService.listStorages(
        async () => [joinedStorage],
        token,
        { skip: 0, size: 20 },
        log,
      )
      assertDeepEqual(result, [joinedStorage])
    })

    it(`list storages by beer as ${token.role}`, async () => {
      const result = await storageService.listStoragesByBeer(
        async () => [joinedStorage],
        (id: string | undefined) => ({
          errorCode: undefined,
          result: id ?? '',
        }),
        {
          authTokenPayload: token,
          id: 'd667bdcb-a26e-4079-b249-c50769129c4c',
        },
        log,
      )
      assertDeepEqual(result, [joinedStorage])
    })

    it(`list storages by brewery as ${token.role}`, async () => {
      const result = await storageService.listStoragesByBrewery(
        async () => [joinedStorage],
        (id: string | undefined) => ({
          errorCode: undefined,
          result: id ?? '',
        }),
        {
          authTokenPayload: token,
          id: 'dd528975-07b6-4e11-b523-5c64986b618f',
        },
        log,
      )
      assertDeepEqual(result, [joinedStorage])
    })

    it(`list storages by style as ${token.role}`, async () => {
      const result = await storageService.listStoragesByStyle(
        async () => [joinedStorage],
        (id: string | undefined) => ({
          errorCode: undefined,
          result: id ?? '',
        }),
        {
          authTokenPayload: token,
          id: 'd3353300-9ccc-4640-940a-5391655a3a73',
        },
        log,
      )
      assertDeepEqual(result, [joinedStorage])
    })

    it(`get annual storage stats as ${token.role}`, async () => {
      const getter = async () => {
        return [{ year: '2022', count: '8' }]
      }
      const result = await storageService.getAnnualStorageStats(
        getter,
        token,
        log,
      )
      assertDeepEqual(result, [{ year: '2022', count: '8' }])
    })

    it(`get monthly storage stats as ${token.role}`, async () => {
      const getter = async () => {
        return [{ year: '2022', month: '10', count: '8' }]
      }
      const result = await storageService.getMonthlyStorageStats(
        getter,
        token,
        log,
      )
      assertDeepEqual(result, [{ year: '2022', month: '10', count: '8' }])
    })
  })
})
