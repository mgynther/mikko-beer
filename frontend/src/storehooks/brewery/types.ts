import type { Pagination } from '../types'

// The shapes these hooks work on and the validators they are given, declared
// here rather than imported from types/. See the comment in
// storehooks/style/types.ts.
//
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

export interface CreateBreweryRequest {
  name: string
  country: string | undefined
}

// The store functions these hooks are given. Each one is a hook and is
// called unconditionally, so what arrives here must follow the rules of hooks
// the same way the store's own function does.
export type UseGetBrewery = (breweryId: string) => {
  data: unknown
  isLoading: boolean
}

export type UseListBreweries = () => {
  list: (pagination: Pagination) => Promise<unknown>
  data: unknown
  isFetching: boolean
  isUninitialized: boolean
}

export type UseSearchBreweries = () => {
  search: (name: string) => Promise<unknown>
  isFetching: boolean
}

export type UseCreateBrewery = () => {
  create: (brewery: CreateBreweryRequest) => Promise<unknown>
  isLoading: boolean
}

export type UseUpdateBrewery = () => {
  update: (brewery: Brewery) => Promise<unknown>
  isLoading: boolean
}

export type ValidateBrewery = (result: unknown) => Brewery

export type ValidateBreweryOrUndefined = (
  result: unknown,
) => Brewery | undefined

export type ValidateBreweryList = (result: unknown) => BreweryList

export type ValidateBreweryListOrUndefined = (
  result: unknown,
) => BreweryList | undefined

export interface CreateBreweryHookIf {
  useCreate: () => {
    create: (breweryRequest: CreateBreweryRequest) => Promise<Brewery>
    isLoading: boolean
  }
}

export interface GetBreweryHookIf {
  useGet: (breweryId: string) => {
    brewery: Brewery | undefined
    isLoading: boolean
  }
}

export interface ListBreweriesHookIf {
  useList: () => {
    list: (pagination: Pagination) => Promise<BreweryList>
    breweryList: BreweryList | undefined
    isLoading: boolean
    isUninitialized: boolean
  }
}

export interface SearchBreweryHookIf {
  useSearch: () => {
    search: (name: string) => Promise<Brewery[]>
    isLoading: boolean
  }
}

export interface UpdateBreweryHookIf {
  useUpdate: () => {
    update: (breweryRequest: Brewery) => Promise<void>
    isLoading: boolean
  }
}
