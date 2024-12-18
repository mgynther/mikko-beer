import { emptySplitApi } from '../api'

import type {
  CreateStorageRequest,
  Storage,
  StorageList
} from '../../core/storage/types'
import { StorageTags } from './types'

const storageApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    getStorage: build.query<{ storage: Storage }, string>({
      query: (storageId: string) => ({
        url: `/storage/${storageId}`,
        method: 'GET'
      }),
      providesTags: [StorageTags.Storage]
    }),
    /* eslint-disable-next-line @typescript-eslint/no-invalid-void-type --
     * Void required here to generate correct hook.
     */
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
    listStoragesByStyle: build.query<StorageList, string>({
      query: (styleId: string) => ({
        url: `/style/${styleId}/storage`,
        method: 'GET'
      }),
      providesTags: [StorageTags.Storage]
    }),
    createStorage: build.mutation<
    { storage: Storage },
    CreateStorageRequest
    >({
      query: (params: CreateStorageRequest) => ({
        url: '/storage',
        method: 'POST',
        body: params
      }),
      invalidatesTags: [StorageTags.Storage]
    }),
    /* eslint-disable-next-line @typescript-eslint/no-invalid-void-type --
     * Void required here to generate correct hook.
     */
    deleteStorage: build.mutation<void, string>({
      query: (id: string) => ({
        url: `/storage/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [StorageTags.Storage]
    })
  })
})

export const {
  useCreateStorageMutation,
  useDeleteStorageMutation,
  useGetStorageQuery,
  useListStoragesQuery,
  useListStoragesByBeerQuery,
  useListStoragesByBreweryQuery,
  useListStoragesByStyleQuery
} = storageApi

export const { endpoints, reducerPath, reducer, middleware } = storageApi
