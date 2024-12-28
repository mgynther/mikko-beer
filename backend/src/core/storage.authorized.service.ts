import * as authorizationService from './internal/auth/authorization.service'
import * as storageService from './internal/storage/validated.service'

import type {
  CreateIf,
  JoinedStorage,
  StorageWithDate,
  UpdateIf
} from "./storage";
import type { log } from './log'
import type { BodyRequest, IdRequest } from './request';
import type { Pagination } from './pagination';
import type { AuthTokenPayload } from './auth/auth-token';
import { validateStyleId } from './style';

export async function createStorage (
  createIf: CreateIf,
  request: BodyRequest,
  log: log
): Promise<StorageWithDate> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  return await storageService.createStorage(createIf, request.body, log)
}

export async function updateStorage (
  updateIf: UpdateIf,
  request: IdRequest,
  body: unknown,
  log: log
): Promise<StorageWithDate> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  return await storageService.updateStorage(
    updateIf,
    request.id,
    body,
    log
  )
}

export async function deleteStorageById (
  deleteStorageById: (id: string) => Promise<void>,
  request: IdRequest,
  log: log
): Promise<void> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  await storageService.deleteStorageById(
    deleteStorageById,
    request.id,
    log
  );
}

export async function findStorageById (
  findById: (id: string) => Promise<JoinedStorage | undefined>,
  request: IdRequest,
  log: log
): Promise<JoinedStorage | undefined> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await storageService.findStorageById(
    findById,
    request.id,
    log
  )
}

export async function listStorages (
  list: (pagination: Pagination) => Promise<JoinedStorage[]>,
  authTokenPayload: AuthTokenPayload,
  pagination: Pagination,
  log: log
): Promise<JoinedStorage[]> {
  authorizationService.authorizeViewer(authTokenPayload)
  return await storageService.listStorages(
    list,
    pagination,
    log
  )
}

export async function listStoragesByBeer (
  listByBeer: (beerId: string) => Promise<JoinedStorage[]>,
  request: IdRequest,
  log: log
): Promise<JoinedStorage[]> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await storageService.listStoragesByBeer(
    listByBeer,
    request.id,
    log
  )
}

export async function listStoragesByBrewery (
  listByBrewery: (beerId: string) => Promise<JoinedStorage[]>,
  request: IdRequest,
  log: log
): Promise<JoinedStorage[]> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await storageService.listStoragesByBrewery(
    listByBrewery,
    request.id,
    log
  )
}

export async function listStoragesByStyle (
  listByStyle: (beerId: string) => Promise<JoinedStorage[]>,
  request: IdRequest,
  log: log
): Promise<JoinedStorage[]> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await storageService.listStoragesByStyle(
    listByStyle,
    validateStyleId(request.id),
    log
  )
}
