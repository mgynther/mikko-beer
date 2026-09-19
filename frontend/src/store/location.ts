import type { Pagination } from './internal/pagination'
import type {
  CreateLocationRequest,
  UpdateLocationRequest,
} from './internal/location/requests'
import {
  useCreateLocationMutation,
  useGetLocationQuery,
  useLazyListLocationsQuery,
  useLazySearchLocationsQuery,
  useUpdateLocationMutation,
} from './internal/location/api'

// The public surface of the location endpoints. See store/beer.ts for why
// every result is built here rather than handed on as the query hook returned
// it.
export interface GetLocationResult {
  data: unknown
  isLoading: boolean
}

export interface ListLocationsResult {
  list: (pagination: Pagination) => Promise<unknown>
  data: unknown
  isFetching: boolean
  isUninitialized: boolean
}

export interface SearchLocationsResult {
  search: (name: string) => Promise<unknown>
  isFetching: boolean
}

export interface CreateLocationResult {
  create: (location: CreateLocationRequest) => Promise<unknown>
  isLoading: boolean
}

export interface UpdateLocationResult {
  update: (location: UpdateLocationRequest) => Promise<unknown>
  isLoading: boolean
}

export function useGetLocation(locationId: string): GetLocationResult {
  const { data, isLoading } = useGetLocationQuery(locationId)
  return {
    data,
    isLoading,
  }
}

export function useListLocations(): ListLocationsResult {
  const [trigger, { data, isFetching, isUninitialized }] =
    useLazyListLocationsQuery()
  return {
    list: async (pagination: Pagination): Promise<unknown> =>
      await trigger(pagination).unwrap(),
    data,
    isFetching,
    isUninitialized,
  }
}

export function useSearchLocations(): SearchLocationsResult {
  const [trigger, { isFetching }] = useLazySearchLocationsQuery()
  return {
    search: async (name: string): Promise<unknown> =>
      await trigger(name).unwrap(),
    isFetching,
  }
}

export function useCreateLocation(): CreateLocationResult {
  const [createLocation, { isLoading }] = useCreateLocationMutation()
  return {
    create: async (location: CreateLocationRequest): Promise<unknown> =>
      await createLocation(location).unwrap(),
    isLoading,
  }
}

export function useUpdateLocation(): UpdateLocationResult {
  const [updateLocation, { isLoading }] = useUpdateLocationMutation()
  return {
    update: async (location: UpdateLocationRequest): Promise<unknown> =>
      await updateLocation(location).unwrap(),
    isLoading,
  }
}
