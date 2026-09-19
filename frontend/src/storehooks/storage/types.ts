import type { BreweryBasics } from '../brewery/types'
import type { Container } from '../container/types'
import type { Style } from '../style/types'

// The shapes these hooks work on and the validators they are given, declared
// here rather than imported from types/. See the comment in
// storehooks/style/types.ts.
export interface CreatedStorage {
  id: string
  beer: string
  bestBefore: string
  container: string
}

export interface Storage {
  id: string
  beerId: string
  beerName: string
  bestBefore: string
  breweries: BreweryBasics[]
  container: Container
  createdAt: string
  hasReview: boolean
  styles: Style[]
}

export interface StorageList {
  storages: Storage[]
}

export interface OneYearStats {
  year: string
  count: string
}

export interface AnnualStats {
  annual: OneYearStats[]
}

export interface OneMonthStats {
  year: string
  month: string
  count: string
}

export interface MonthlyStats {
  monthly: OneMonthStats[]
}

export interface CreateStorageRequest {
  beer: string
  bestBefore: string
  container: string
}

// The store functions these hooks are given. See the comment in
// storehooks/brewery/types.ts.
export interface StorageQueryResult {
  data: unknown
  isLoading: boolean
}

export type UseGetStorage = (storageId: string) => StorageQueryResult

export type UseListStorages = () => StorageQueryResult

export type UseListStoragesBy = (id: string) => StorageQueryResult

export type UseGetStorageStats = () => StorageQueryResult

export type UseCreateStorage = () => {
  create: (storage: CreateStorageRequest) => Promise<unknown>
  hasError: boolean
  isLoading: boolean
}

export type UseDeleteStorage = () => {
  delete: (storageId: string) => Promise<void>
}

export type ValidateCreatedStorage = (result: unknown) => CreatedStorage

export type ValidateStorageOrUndefined = (
  result: unknown,
) => Storage | undefined

export type ValidateStorageListOrUndefined = (
  result: unknown,
) => StorageList | undefined

export type ValidateAnnualStatsOrUndefined = (
  result: unknown,
) => AnnualStats | undefined

export type ValidateMonthlyStatsOrUndefined = (
  result: unknown,
) => MonthlyStats | undefined

export interface CreateStorageHookIf {
  useCreate: () => {
    create: (request: CreateStorageRequest) => Promise<CreatedStorage>
    hasError: boolean
    isLoading: boolean
  }
}

export interface GetStorageHookIf {
  useGet: (storageId: string) => {
    storage: Storage | undefined
    isLoading: boolean
  }
}

export interface DeleteStorageHookIf {
  useDelete: () => {
    delete: (storageId: string) => Promise<void>
  }
}

export interface ListStoragesHookIf {
  useList: () => {
    storages: StorageList | undefined
    isLoading: boolean
  }
}

export interface ListStoragesByHookIf {
  useList: (id: string) => {
    storages: StorageList | undefined
    isLoading: boolean
  }
}

export interface GetAnnualStorageStatsHookIf {
  useAnnualStats: () => {
    stats: AnnualStats | undefined
    isLoading: boolean
  }
}

export interface GetMonthlyStorageStatsHookIf {
  useMonthlyStats: () => {
    stats: MonthlyStats | undefined
    isLoading: boolean
  }
}
