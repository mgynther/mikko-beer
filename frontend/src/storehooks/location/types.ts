import type { Pagination } from '../types'

// The shapes these hooks work on and the validators they are given, declared
// here rather than imported from types/. See the comment in
// storehooks/style/types.ts.
export interface Location {
  id: string
  name: string
}

export interface LocationList {
  locations: Location[]
}

export interface CreateLocationRequest {
  name: string
}

// The store functions these hooks are given. See the comment in
// storehooks/brewery/types.ts.
export type UseGetLocation = (locationId: string) => {
  data: unknown
  isLoading: boolean
}

export type UseListLocations = () => {
  list: (pagination: Pagination) => Promise<unknown>
  data: unknown
  isFetching: boolean
  isUninitialized: boolean
}

export type UseSearchLocations = () => {
  search: (name: string) => Promise<unknown>
  isFetching: boolean
}

export type UseCreateLocation = () => {
  create: (location: CreateLocationRequest) => Promise<unknown>
  isLoading: boolean
}

export type UseUpdateLocation = () => {
  update: (location: Location) => Promise<unknown>
  isLoading: boolean
}

export type ValidateLocation = (result: unknown) => Location

export type ValidateLocationOrUndefined = (
  result: unknown,
) => Location | undefined

export type ValidateLocationList = (result: unknown) => LocationList

export type ValidateLocationListOrUndefined = (
  result: unknown,
) => LocationList | undefined

export interface CreateLocationHookIf {
  useCreate: () => {
    create: (locationRequest: CreateLocationRequest) => Promise<Location>
    isLoading: boolean
  }
}

export interface GetLocationHookIf {
  useGet: (locationId: string) => {
    location: Location | undefined
    isLoading: boolean
  }
}

export interface ListLocationsHookIf {
  useList: () => {
    list: (pagination: Pagination) => Promise<LocationList>
    locationList: LocationList | undefined
    isLoading: boolean
    isUninitialized: boolean
  }
}

export interface SearchLocationHookIf {
  useSearch: () => {
    search: (name: string) => Promise<Location[]>
    isLoading: boolean
  }
}

export interface UpdateLocationHookIf {
  useUpdate: () => {
    update: (locationRequest: Location) => Promise<void>
    isLoading: boolean
  }
}
