import { emptySplitApi } from '../api'

import type { Pagination } from '../../core/types'

import type {
  Location,
  LocationList,
  CreateLocationRequest
} from '../../core/location/types'
import { LocationTags } from './types'

const locationApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    getLocation: build.query<{ location: Location }, string>({
      query: (locationId: string) => ({
        url: `/location/${locationId}`,
        method: 'GET'
      }),
      providesTags: (result) =>
        result === undefined
          ? [LocationTags.Location]
          : [{ type: LocationTags.Location, id: result.location.id }]
    }),
    listLocations: build.query<LocationList, Pagination>({
      query: (pagination: Pagination) => ({
        url: `/location?size=${pagination.size}&skip=${pagination.skip}`,
        method: 'GET'
      }),
      providesTags: [LocationTags.Location]
    }),
    searchLocations: build.query<LocationList, string>({
      query: (name: string) => ({
        url: '/location/search',
        method: 'POST',
        body: {
          name
        }
      })
    }),
    createLocation: build.mutation<{
      location: Location
    }, Partial<CreateLocationRequest>>({
      query: (location: CreateLocationRequest) => ({
        url: '/location',
        method: 'POST',
        body: {
          ...location
        }
      }),
      invalidatesTags: [LocationTags.Location]
    }),
    updateLocation: build.mutation<{ location: Location }, Location>({
      query: (location: Location) => ({
        url: `/location/${location.id}`,
        method: 'PUT',
        body: {
          name: location.name
        }
      }),
      invalidatesTags: [
        LocationTags.Location,
      ]
    })
  })
})

export const {
  useCreateLocationMutation,
  useGetLocationQuery,
  useLazyListLocationsQuery,
  useLazySearchLocationsQuery,
  useListLocationsQuery,
  useUpdateLocationMutation
} = locationApi

export const { endpoints, reducerPath, reducer, middleware } = locationApi
