import { emptySplitApi } from '../api'

import type { Pagination } from '../pagination'

import type { CreateLocationRequest, UpdateLocationRequest } from './requests'
import { LocationTags } from './tags'
import { locationStatsTagTypes } from '../stats/tags'

const locationApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    getLocation: build.query<unknown, string>({
      query: (locationId: string) => ({
        url: `/location/${locationId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, locationId) => [
        { type: LocationTags.Location, id: locationId },
      ],
    }),
    listLocations: build.query<unknown, Pagination>({
      query: (pagination: Pagination) => ({
        url: `/location?size=${pagination.size}&skip=${pagination.skip}`,
        method: 'GET',
      }),
      providesTags: [LocationTags.Location],
    }),
    searchLocations: build.query<unknown, string>({
      query: (name: string) => ({
        url: '/location/search',
        method: 'POST',
        body: {
          name,
        },
      }),
    }),
    createLocation: build.mutation<unknown, Partial<CreateLocationRequest>>({
      query: (location: CreateLocationRequest) => ({
        url: '/location',
        method: 'POST',
        body: {
          ...location,
        },
      }),
      invalidatesTags: [LocationTags.Location],
    }),
    updateLocation: build.mutation<unknown, UpdateLocationRequest>({
      query: (location: UpdateLocationRequest) => ({
        url: `/location/${location.id}`,
        method: 'PUT',
        body: {
          name: location.name,
        },
      }),
      invalidatesTags: [LocationTags.Location, ...locationStatsTagTypes()],
    }),
  }),
})

export const {
  useCreateLocationMutation,
  useGetLocationQuery,
  useLazyListLocationsQuery,
  useLazySearchLocationsQuery,
  useUpdateLocationMutation,
} = locationApi

export const { endpoints, reducerPath, reducer, middleware } = locationApi
