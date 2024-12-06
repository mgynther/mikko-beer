import * as authService from '../../core/authentication/authentication.service'
import * as storageService from '../../core/storage/storage.service'

import type { CreateIf, JoinedStorage, Storage, UpdateIf } from "./storage";
import {
  validateCreateStorageRequest,
  validateStorageId,
  validateUpdateStorageRequest
} from "./storage";
import type { log } from '../log'
import type { BodyRequest, IdRequest } from '../request';
import type { Pagination } from '../pagination';
import type { AuthTokenPayload } from '../authentication/auth-token';
import { validateBeerId } from '../beer/beer';
import { validateBreweryId } from '../brewery/brewery';
import { validateStyleId } from '../style/style';

export async function createStorage (
  createIf: CreateIf,
  request: BodyRequest,
  log: log
): Promise<Storage> {
  authService.authenticateAdminPayload(request.authTokenPayload)
  const createRequest = validateCreateStorageRequest(request.body)
  return await storageService.createStorage(createIf, createRequest, log)
}

export async function updateStorage (
  updateIf: UpdateIf,
  request: IdRequest,
  body: unknown,
  log: log
): Promise<Storage> {
  authService.authenticateAdminPayload(request.authTokenPayload)
  const updateRequest = validateUpdateStorageRequest(body, request.id)
  return await storageService.updateStorage(
    updateIf,
    {
      ...updateRequest.request,
      id: updateRequest.id,
    },
    log
  )
}

export async function deleteStorageById (
  deleteStorageById: (id: string) => Promise<void>,
  request: IdRequest,
  log: log
): Promise<void> {
  authService.authenticateAdminPayload(request.authTokenPayload)
  await storageService.deleteStorageById(
    deleteStorageById,
    validateStorageId(request.id),
    log
  );
}

export async function findStorageById (
  findById: (id: string) => Promise<JoinedStorage | undefined>,
  request: IdRequest,
  log: log
): Promise<JoinedStorage | undefined> {
  authService.authenticateViewerPayload(request.authTokenPayload)
  return await storageService.findStorageById(
    findById,
    validateStorageId(request.id),
    log
  )
}

export async function listStorages (
  list: (pagination: Pagination) => Promise<JoinedStorage[]>,
  authTokenPayload: AuthTokenPayload,
  pagination: Pagination,
  log: log
): Promise<JoinedStorage[]> {
  authService.authenticateViewerPayload(authTokenPayload)
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
  authService.authenticateViewerPayload(request.authTokenPayload)
  return await storageService.listStoragesByBeer(
    listByBeer,
    validateBeerId(request.id),
    log
  )
}

export async function listStoragesByBrewery (
  listByBrewery: (beerId: string) => Promise<JoinedStorage[]>,
  request: IdRequest,
  log: log
): Promise<JoinedStorage[]> {
  authService.authenticateViewerPayload(request.authTokenPayload)
  return await storageService.listStoragesByBrewery(
    listByBrewery,
    validateBreweryId(request.id),
    log
  )
}

export async function listStoragesByStyle (
  listByStyle: (beerId: string) => Promise<JoinedStorage[]>,
  request: IdRequest,
  log: log
): Promise<JoinedStorage[]> {
  authService.authenticateViewerPayload(request.authTokenPayload)
  return await storageService.listStoragesByStyle(
    listByStyle,
    validateStyleId(request.id),
    log
  )
}
