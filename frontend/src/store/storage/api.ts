import { emptySplitApi } from '../api'

import { type Storage, type StorageList, StorageTags } from './types'

interface CreateStorageParams {
  beer: string
  bestBefore: string
  container: string
}

const storageApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    getStorage: build.query<{ storage: Storage }, string>({
      query: (storageId: string) => ({
        url: `/storage/${storageId}`,
        method: 'GET'
      }),
      providesTags: [StorageTags.Storage]
    }),
    listStorages: build.query<StorageList, void>({
      query: () => ({
        url: '/storage',
        method: 'GET'
      }),
      providesTags: [StorageTags.Storage]
    }),
    listStoragesByBeer: build.query<StorageList, string>({
      query: (beerId: string) => ({
        url: `/beer/${beerId}/storage`,
        method: 'GET'
      }),
      providesTags: [StorageTags.Storage]
    }),
    listStoragesByBrewery: build.query<StorageList, string>({
      query: (breweryId: string) => ({
        url: `/brewery/${breweryId}/storage`,
        method: 'GET'
      }),
      providesTags: [StorageTags.Storage]
    }),
    createStorage: build.mutation<
    { storage: Storage },
    Partial<CreateStorageParams>
    >({
      query: (params: CreateStorageParams) => ({
        url: '/storage',
        method: 'POST',
        body: params
      }),
      invalidatesTags: [StorageTags.Storage]
    })
  })
})

export const {
  useCreateStorageMutation,
  useGetStorageQuery,
  useListStoragesQuery,
  useListStoragesByBeerQuery,
  useListStoragesByBreweryQuery
} = storageApi

export const { endpoints, reducerPath, reducer, middleware } = storageApi
