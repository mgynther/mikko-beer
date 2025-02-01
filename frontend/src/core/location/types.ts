import type { Pagination , InfiniteScroll } from "../types"

import type { GetLogin } from "../login/types"

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

export interface ListLocationsIf {
  useList: () => {
    list: (pagination: Pagination) => Promise<LocationList>
    locationList: LocationList | undefined
    isLoading: boolean
    isUninitialized: boolean
  },
  infiniteScroll: InfiniteScroll
}

export interface UpdateLocationIf {
  useUpdate: () => {
    update: (locationRequest: Location) => Promise<void>
    isLoading: boolean
  },
  login: GetLogin
}

export interface SearchLocationIf {
  useSearch: () => {
    search: (name: string) => Promise<Location[]>,
    isLoading: boolean
  },
  create: CreateLocationIf
}
