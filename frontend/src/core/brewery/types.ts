import type { Pagination } from "../types"

export interface CreateBreweryRequest {
  name: string
}

export interface Brewery {
  id: string
  name: string
}

export interface BreweryList {
  breweries: Brewery[]
}

export interface CreateBreweryIf {
  useCreate: () => {
    create: (breweryRequest: CreateBreweryRequest) => Promise<Brewery>
    isLoading: boolean
  }
}

export interface GetBreweryIf {
  useGet: (breweryId: string) => {
    brewery: Brewery | undefined
    isLoading: boolean
  }
}

export interface ListBreweriesIf {
  useList: () => {
    list: (pagination: Pagination) => Promise<BreweryList>
    breweryList: BreweryList | undefined
    isLoading: boolean
    isUninitialized: boolean
  }
}

export interface UpdateBreweryIf {
  useUpdate: () => {
    update: (breweryRequest: Brewery) => Promise<void>
    isLoading: boolean
  }
}

export interface SearchBreweryIf {
  useSearch: () => {
    search: (name: string) => Promise<Brewery[]>,
    isLoading: boolean
  }
}

export interface SelectBreweryIf {
  create: CreateBreweryIf,
  search: SearchBreweryIf
}
