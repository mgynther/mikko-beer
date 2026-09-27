import type { Pagination } from '../pagination.js'
import type {
  AuthorizedRequest,
  BodyRequest,
  IdBodyRequest,
  IdRequest,
  PaginationRequest,
} from '../request.js'

export type AnnualStorageStats = Array<{
  year: string
  count: string
}>

export type MonthlyStorageStats = Array<{
  year: string
  month: string
  count: string
}>

export interface CreatedOrUpdatedStorage {
  id: string
  bestBefore: string
  beer: string
  container: string
}

export interface ReadStorage {
  id: string
  beerId: string
  beerName: string
  bestBefore: string
  breweries: Array<{
    id: string
    name: string
  }>
  container: {
    id: string
    type: string
    size: string
  }
  createdAt: string
  hasReview: boolean
  styles: Array<{
    id: string
    name: string
  }>
}

export interface AnnualStorageStatsBody {
  annual: AnnualStorageStats
}

export interface MonthlyStorageStatsBody {
  monthly: MonthlyStorageStats
}

export interface StorageBody {
  storage: CreatedOrUpdatedStorage
}

export interface ReadStorageBody {
  storage: ReadStorage
}

export interface StoragesBody {
  storages: ReadStorage[]
}

export interface StorageListBody {
  storages: ReadStorage[]
  pagination: Pagination
}

export interface StorageHandlers {
  getAnnualStats: (
    request: AuthorizedRequest,
  ) => Promise<AnnualStorageStatsBody>
  getMonthlyStats: (
    request: AuthorizedRequest,
  ) => Promise<MonthlyStorageStatsBody>
  create: (request: BodyRequest) => Promise<StorageBody>
  update: (request: IdBodyRequest) => Promise<StorageBody>
  delete: (request: IdRequest) => Promise<void>
  find: (request: IdRequest) => Promise<ReadStorageBody>
  listByBeer: (request: IdRequest) => Promise<StoragesBody>
  listByBrewery: (request: IdRequest) => Promise<StoragesBody>
  listByStyle: (request: IdRequest) => Promise<StoragesBody>
  list: (request: PaginationRequest) => Promise<StorageListBody>
}
