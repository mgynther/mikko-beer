import type { CreateStorageRequest } from './internal/storage/requests'
import {
  useCreateStorageMutation,
  useDeleteStorageMutation,
  useGetAnnualStorageStatsQuery,
  useGetMonthlyStorageStatsQuery,
  useGetStorageQuery,
  useListStoragesQuery,
  useListStoragesByBeerQuery,
  useListStoragesByBreweryQuery,
  useListStoragesByStyleQuery,
} from './internal/storage/api'

// The public surface of the storage endpoints. See store/beer.ts for why
// every result is built here rather than handed on as the query hook returned
// it.
export interface StorageQueryResult {
  data: unknown
  isLoading: boolean
}

// Creating a storage both unwraps, so that a failed creation rejects, and
// reports hasError, which is what the form that calls it reads while it is
// still open.
export interface CreateStorageResult {
  create: (storage: CreateStorageRequest) => Promise<unknown>
  hasError: boolean
  isLoading: boolean
}

export interface DeleteStorageResult {
  delete: (storageId: string) => Promise<void>
}

export function useGetStorage(storageId: string): StorageQueryResult {
  const { data, isLoading } = useGetStorageQuery(storageId)
  return {
    data,
    isLoading,
  }
}

export function useListStorages(): StorageQueryResult {
  const { data, isLoading } = useListStoragesQuery()
  return {
    data,
    isLoading,
  }
}

export function useListStoragesByBeer(beerId: string): StorageQueryResult {
  const { data, isLoading } = useListStoragesByBeerQuery(beerId)
  return {
    data,
    isLoading,
  }
}

export function useListStoragesByBrewery(
  breweryId: string,
): StorageQueryResult {
  const { data, isLoading } = useListStoragesByBreweryQuery(breweryId)
  return {
    data,
    isLoading,
  }
}

export function useListStoragesByStyle(styleId: string): StorageQueryResult {
  const { data, isLoading } = useListStoragesByStyleQuery(styleId)
  return {
    data,
    isLoading,
  }
}

export function useGetAnnualStorageStats(): StorageQueryResult {
  const { data, isLoading } = useGetAnnualStorageStatsQuery()
  return {
    data,
    isLoading,
  }
}

export function useGetMonthlyStorageStats(): StorageQueryResult {
  const { data, isLoading } = useGetMonthlyStorageStatsQuery()
  return {
    data,
    isLoading,
  }
}

export function useCreateStorage(): CreateStorageResult {
  const [createStorage, { error, isLoading }] = useCreateStorageMutation()
  return {
    create: async (storage: CreateStorageRequest): Promise<unknown> =>
      await createStorage(storage).unwrap(),
    hasError: error !== undefined,
    isLoading,
  }
}

export function useDeleteStorage(): DeleteStorageResult {
  const [deleteStorage] = useDeleteStorageMutation()
  return {
    delete: async (storageId: string): Promise<void> => {
      await deleteStorage(storageId)
    },
  }
}
