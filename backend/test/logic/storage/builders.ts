import type {
  CreateStorageRequest,
  JoinedStorage,
  Storage,
  StorageWithDate,
  UpdateStorageRequest,
} from '../../../src/logic/storage/storage.js'
import { buildContainer } from '../container/builders.js'

// A valid Storage and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildStorage(overrides: Partial<Storage> = {}): Storage {
  return {
    id: '4044318f-f77a-4129-82c6-7aac59a933d0',
    beer: '4a53dba9-7cf1-4050-9201-6f2f6738fd6d',
    bestBefore: '2025-01-01T00:00:00.000Z',
    container: '2b6b98a8-c784-4185-95d6-32e6684b98bd',
    ...overrides,
  }
}

// A valid StorageWithDate and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildStorageWithDate(
  overrides: Partial<StorageWithDate> = {},
): StorageWithDate {
  return {
    id: '82f4631b-eaa9-4f19-b966-76958d6d342d',
    beer: '34253b32-22ee-4833-9a39-bb2cead71d24',
    bestBefore: new Date('2025-01-01T00:00:00.000Z'),
    container: 'd016bc42-8b8d-46c9-9c36-edd5947ec238',
    ...overrides,
  }
}

// A valid JoinedStorage and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildJoinedStorage(
  overrides: Partial<JoinedStorage> = {},
): JoinedStorage {
  return {
    id: 'dcadfe1b-f017-45fa-9ede-e438af983dac',
    beerId: '442ae996-a3bc-4eab-86ed-99e4c294cd06',
    beerName: 'Beer',
    bestBefore: new Date('2025-01-01T00:00:00.000Z'),
    breweries: [],
    container: buildContainer(),
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    hasReview: false,
    styles: [],
    ...overrides,
  }
}

// A valid CreateStorageRequest and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildCreateStorageRequest(
  overrides: Partial<CreateStorageRequest> = {},
): CreateStorageRequest {
  return {
    beer: 'cb01842d-2a73-465e-b497-815bf092ce65',
    bestBefore: '2025-01-01T00:00:00.000Z',
    container: 'f2cdb721-ea9e-4fdb-b730-85f01f56305d',
    ...overrides,
  }
}

// A valid UpdateStorageRequest and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildUpdateStorageRequest(
  overrides: Partial<UpdateStorageRequest> = {},
): UpdateStorageRequest {
  return {
    beer: '74492bef-ea8e-4d43-b673-f0d94b18a2b4',
    bestBefore: '2025-01-01T00:00:00.000Z',
    container: 'dec42b38-dff8-43c4-9dce-628bb99618c9',
    ...overrides,
  }
}
