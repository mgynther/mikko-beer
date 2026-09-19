import { emptySplitApi } from '../api'

import { StorageTags } from './tags'
import type { CreateStorageRequest } from './requests'

const storageApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    getStorage: build.query<unknown, string>({
      query: (storageId: string) => ({
        url: `/storage/${storageId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, storageId) => [
        { type: StorageTags.Storage, id: storageId },
      ],
    }),
    getAnnualStorageStats: build.query<unknown, void>({
      query: () => ({
        url: '/storage/annual-stats',
        method: 'GET',
      }),
      providesTags: [StorageTags.Storage],
    }),
    getMonthlyStorageStats: build.query<unknown, void>({
      query: () => ({
        url: '/storage/monthly-stats',
        method: 'GET',
      }),
      providesTags: [StorageTags.Storage],
    }),
    listStorages: build.query<unknown, void>({
      query: () => ({
        url: '/storage',
        method: 'GET',
      }),
      providesTags: [StorageTags.Storage],
    }),
    listStoragesByBeer: build.query<unknown, string>({
      query: (beerId: string) => ({
        url: `/beer/${beerId}/storage`,
        method: 'GET',
      }),
      providesTags: [StorageTags.Storage],
    }),
    listStoragesByBrewery: build.query<unknown, string>({
      query: (breweryId: string) => ({
        url: `/brewery/${breweryId}/storage`,
        method: 'GET',
      }),
      providesTags: [StorageTags.Storage],
    }),
    listStoragesByStyle: build.query<unknown, string>({
      query: (styleId: string) => ({
        url: `/style/${styleId}/storage`,
        method: 'GET',
      }),
      providesTags: [StorageTags.Storage],
    }),
    createStorage: build.mutation<unknown, CreateStorageRequest>({
      query: (params: CreateStorageRequest) => ({
        url: '/storage',
        method: 'POST',
        body: params,
      }),
      invalidatesTags: [StorageTags.Storage],
    }),
    deleteStorage: build.mutation<unknown, string>({
      query: (id: string) => ({
        url: `/storage/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [StorageTags.Storage],
    }),
  }),
})

export const {
  useCreateStorageMutation,
  useDeleteStorageMutation,
  useGetAnnualStorageStatsQuery,
  useGetMonthlyStorageStatsQuery,
  useGetStorageQuery,
  useListStoragesQuery,
  useListStoragesByBeerQuery,
  useListStoragesByBreweryQuery,
  useListStoragesByStyleQuery,
} = storageApi

export const { endpoints, reducerPath, reducer, middleware } = storageApi
