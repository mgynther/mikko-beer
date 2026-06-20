import type { Brewery, SelectBreweryIf } from '../brewery/types'
import type { SearchFieldIf } from '../search/types'
import type { SelectStyleIf, Style } from '../style/types'
import type { InfiniteScroll, Pagination } from '../types'

export interface CreateBeerRequest {
  name: string
  breweries: string[]
  styles: string[]
}

export interface Beer {
  id: string
  name: string
  breweries: Brewery[]
  styles: Style[]
}

export interface BeerWithIds {
  id: string
  name: string
  breweries: string[]
  styles: string[]
}

export interface BeerList {
  beers: Beer[]
}

type UseCreateBeer = () => {
  create: (request: CreateBeerRequest) => Promise<BeerWithIds>
  isLoading: boolean
}

export interface CreateBeerHookIf {
  useCreate: UseCreateBeer
}

export interface CreateBeerIf {
  useCreate: UseCreateBeer
  editBeerIf: EditBeerIf
}

export interface UpdateBeerIf {
  useUpdate: () => {
    update: (request: BeerWithIds) => Promise<void>
    isLoading: boolean
  }
  editBeerIf: EditBeerIf
}

export interface GetBeerIf {
  useGetBeer: (beerId: string) => {
    beer: Beer | undefined
    isLoading: boolean
  }
}

export interface ListBeersIf {
  useList: () => {
    list: (pagination: Pagination) => Promise<BeerList>
    beerList: BeerList | undefined
    isLoading: boolean
    isUninitialized: boolean
  }
  infiniteScroll: InfiniteScroll
}

export interface EditBeerIf {
  selectBreweryIf: SelectBreweryIf
  selectStyleIf: SelectStyleIf
}

type UseSearchBeer = () => {
  search: (query: string) => Promise<Beer[]>
  isLoading: boolean
}

export interface SearchBeerHookIf {
  useSearch: UseSearchBeer
}

export interface SearchBeerIf {
  useSearch: UseSearchBeer
  searchFieldIf: SearchFieldIf
}

export interface SelectBeerIf {
  create: CreateBeerIf
  search: SearchBeerIf
}
