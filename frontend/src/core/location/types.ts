import type { Pagination, InfiniteScroll } from '../types'

import type { GetLogin } from '../login/types'

export interface CreateLocationRequest {
  name: string
}

export interface Location {
  id: string
  name: string
}

export interface LocationList {
  locations: Location[]
}

export interface CreateLocationIf {
  useCreate: () => {
    create: (locationRequest: CreateLocationRequest) => Promise<Location>
    isLoading: boolean
  }
}

export interface GetLocationIf {
  useGet: (locationId: string) => {
    location: Location | undefined
    isLoading: boolean
  }
}

type UseListLocations = () => {
  list: (pagination: Pagination) => Promise<LocationList>
  locationList: LocationList | undefined
  isLoading: boolean
  isUninitialized: boolean
}

export interface ListLocationsHookIf {
  useList: UseListLocations
}

export interface ListLocationsIf {
  useList: UseListLocations
  infiniteScroll: InfiniteScroll
}

type UseUpdateLogin = () => {
  update: (locationRequest: Location) => Promise<void>
  isLoading: boolean
}

export interface UpdateLocationHookIf {
  useUpdate: UseUpdateLogin
}

export interface UpdateLocationIf {
  useUpdate: UseUpdateLogin
  login: GetLogin
}

type UseSearchLocation = () => {
  search: (name: string) => Promise<Location[]>
  isLoading: boolean
}

export interface SearchLocationHookIf {
  useSearch: UseSearchLocation
}

export interface SearchLocationIf {
  useSearch: UseSearchLocation
  create: CreateLocationIf
}
