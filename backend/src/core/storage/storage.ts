import type { Container } from '../container/container'
import type { LockId } from '../db'

export interface CreateIf {
  insertStorage: (request: CreateStorageRequest) => Promise<StorageWithDate>
  lockBeer: LockId
  lockContainer: LockId
}

export interface UpdateIf {
  updateStorage: (request: Storage) => Promise<StorageWithDate>
  lockBeer: LockId
  lockContainer: LockId
}

export interface Storage {
  id: string
  bestBefore: string
  beer: string
  container: string
}

export interface StorageWithDate {
  id: string
  bestBefore: Date
  beer: string
  container: string
}

export interface JoinedStorage {
  id: string
  beerId: string
  beerName: string
  bestBefore: Date
  breweries: Array<{
    id: string
    name: string
  }>
  container: Container
  createdAt: Date
  hasReview: boolean
  styles: Array<{
    id: string
    name: string
  }>
}

export interface StorageRequest {
  beer: string
  bestBefore: string
  container: string
}

export type CreateStorageRequest = StorageRequest
export type UpdateStorageRequest = StorageRequest
