import type { BreweryBasics } from '../brewery/types'
import type { Style } from '../style/types'
import type { Pagination } from '../types'

// The shapes these hooks work on and the validators they are given, declared
// here rather than imported from types/. See the comment in
// storehooks/style/types.ts.
export interface Beer {
  id: string
  name: string
  breweries: BreweryBasics[]
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

export interface CreateBeerRequest {
  name: string
  breweries: string[]
  styles: string[]
}

// The store functions these hooks are given. Each one is a hook and is
// called unconditionally, so what arrives here must follow the rules of hooks
// the same way the store's own function does.
export type UseGetBeer = (beerId: string) => {
  data: unknown
  isLoading: boolean
}

export type UseListBeers = () => {
  list: (pagination: Pagination) => Promise<unknown>
  data: unknown
  isFetching: boolean
  isUninitialized: boolean
}

export type UseSearchBeers = () => {
  search: (name: string) => Promise<unknown>
  isFetching: boolean
}

export type UseCreateBeer = () => {
  create: (beer: CreateBeerRequest) => Promise<unknown>
  isLoading: boolean
}

export type UseUpdateBeer = () => {
  update: (beer: BeerWithIds) => Promise<unknown>
  isLoading: boolean
}

export type ValidateBeerOrUndefined = (result: unknown) => Beer | undefined

export type ValidateBeerWithIds = (result: unknown) => BeerWithIds

export type ValidateBeerList = (result: unknown) => BeerList

export type ValidateBeerListOrUndefined = (
  result: unknown,
) => BeerList | undefined

export interface CreateBeerHookIf {
  useCreate: () => {
    create: (request: CreateBeerRequest) => Promise<BeerWithIds>
    isLoading: boolean
  }
}

export interface GetBeerHookIf {
  useGetBeer: (beerId: string) => {
    beer: Beer | undefined
    isLoading: boolean
  }
}

export interface ListBeersHookIf {
  useList: () => {
    list: (pagination: Pagination) => Promise<BeerList>
    beerList: BeerList | undefined
    isLoading: boolean
    isUninitialized: boolean
  }
}

export interface SearchBeerHookIf {
  useSearch: () => {
    search: (query: string) => Promise<Beer[]>
    isLoading: boolean
  }
}

export interface UpdateBeerHookIf {
  useUpdate: () => {
    update: (request: BeerWithIds) => Promise<void>
    isLoading: boolean
  }
}
