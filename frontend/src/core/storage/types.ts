import type { Brewery } from '../brewery/types'
import type { Container } from '../../core/container/types'
import type { Style } from '../style/types'
import type { UseUrlSearchParams } from '../types'
import type { GetLogin } from '../login/types'

export interface CreateStorageRequest {
  beer: string
  bestBefore: string
  container: string
}

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
  breweries: Brewery[]
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

export interface CreateStorageIf {
  useCreate: () => {
    create: (request: CreateStorageRequest) => Promise<CreatedStorage>
    hasError: boolean
    isLoading: boolean
  }
}

export interface GetStorageIf {
  useGet: (storageId: string) => {
    storage: Storage | undefined
    isLoading: boolean
  }
}

type UseDeleteStorage = () => {
  delete: (storageId: string) => Promise<void>
}

export interface DeleteStorageHookIf {
  useDelete: UseDeleteStorage
}

export interface DeleteStorageIf {
  useDelete: UseDeleteStorage
  getLogin: GetLogin
}

type UseListStorages = () => {
  storages: StorageList | undefined
  isLoading: boolean
}

export interface ListStoragesHookIf {
  useList: UseListStorages
}

export interface ListStoragesIf {
  useList: UseListStorages
  delete: DeleteStorageIf
}

type UseListStoragesBy = (id: string) => {
  storages: StorageList | undefined
  isLoading: boolean
}

export interface ListStoragesByHookIf {
  useList: UseListStoragesBy
}

export interface ListStoragesByIf {
  useList: UseListStoragesBy
  delete: DeleteStorageIf
}

export interface GetAnnualStorageStatsIf {
  useAnnualStats: () => {
    stats: AnnualStats | undefined
    isLoading: boolean
  }
}

export interface GetMonthlyStorageStatsIf {
  useMonthlyStats: () => {
    stats: MonthlyStats | undefined
    isLoading: boolean
  }
}

export interface StorageStatsIf {
  annual: GetAnnualStorageStatsIf
  monthly: GetMonthlyStorageStatsIf
  setSearch: (mode: string, state: Record<string, string>) => void
  useUrlSearchParams: UseUrlSearchParams
}
