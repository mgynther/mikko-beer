import type { GetLogin } from '../login/types'
import type { SearchFieldIf } from '../search/types'
import type { Pagination, InfiniteScroll } from '../types'

export interface CreateBreweryRequest {
  name: string
  country: string | undefined
}

// Breweries referred to by other entities are not known by their country.
export interface BreweryBasics {
  id: string
  name: string
}

export interface Brewery extends BreweryBasics {
  country: string | undefined
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
  infiniteScroll: InfiniteScroll
}

type UseUpdateBrewery = () => {
  update: (breweryRequest: Brewery) => Promise<void>
  isLoading: boolean
}

export interface UpdateBreweryHookIf {
  useUpdate: UseUpdateBrewery
}

export interface UpdateBreweryIf {
  useUpdate: UseUpdateBrewery
  getLogin: GetLogin
}

type UseSearchBrewery = () => {
  search: (name: string) => Promise<Brewery[]>
  isLoading: boolean
}

export interface SearchBreweryHookIf {
  useSearch: UseSearchBrewery
}

export interface SearchBreweryIf {
  useSearch: UseSearchBrewery
  searchFieldIf: SearchFieldIf
}

export interface SelectBreweryIf {
  create: CreateBreweryIf
  search: SearchBreweryIf
}
