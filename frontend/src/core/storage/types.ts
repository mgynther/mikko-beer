import type { Brewery } from '../brewery/types'
import type { Container } from '../../core/container/types'
import type { Style } from '../style/types'

export interface CreateStorageRequest {
  beer: string
  bestBefore: string
  container: string
}

export interface Storage {
  id: string
  beerId: string
  beerName: string
  bestBefore: string
  breweries: Brewery[]
  container: Container
  createdAt: string
  hasReview: boolean
  styles: Style[]
}

export interface StorageList {
  storages: Storage[]
}

export interface CreateStorageIf {
  useCreate: () => {
    create: (request: CreateStorageRequest) => Promise<void>
    hasError: boolean
    isLoading: boolean
  }
}

export interface GetStorageIf {
  useGet: (storageId: string) => {
    storage: Storage | undefined,
    isLoading: boolean
  }
}

export interface DeleteStorageIf {
  useDelete: () => {
    delete: (storageId: string) => Promise<void>
  }
}

export interface ListStoragesIf {
  useList: () => {
    storages: StorageList | undefined
    isLoading: boolean
  },
  delete: DeleteStorageIf
}

export interface ListStoragesByIf {
  useList: (id: string) => {
    storages: StorageList | undefined
    isLoading: boolean
  },
  delete: DeleteStorageIf
}
