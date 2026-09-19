import type { Pagination } from './internal/pagination'
import type {
  CreateBreweryRequest,
  UpdateBreweryRequest,
} from './internal/brewery/requests'
import {
  useCreateBreweryMutation,
  useGetBreweryQuery,
  useLazyListBreweriesQuery,
  useLazySearchBreweriesQuery,
  useUpdateBreweryMutation,
} from './internal/brewery/api'

// The public surface of the brewery endpoints. See store/beer.ts for why
// every result is built here rather than handed on as the query hook returned
// it.
export interface GetBreweryResult {
  data: unknown
  isLoading: boolean
}

export interface ListBreweriesResult {
  list: (pagination: Pagination) => Promise<unknown>
  data: unknown
  isFetching: boolean
  isUninitialized: boolean
}

export interface SearchBreweriesResult {
  search: (name: string) => Promise<unknown>
  isFetching: boolean
}

export interface CreateBreweryResult {
  create: (brewery: CreateBreweryRequest) => Promise<unknown>
  isLoading: boolean
}

export interface UpdateBreweryResult {
  update: (brewery: UpdateBreweryRequest) => Promise<unknown>
  isLoading: boolean
}

export function useGetBrewery(breweryId: string): GetBreweryResult {
  const { data, isLoading } = useGetBreweryQuery(breweryId)
  return {
    data,
    isLoading,
  }
}

export function useListBreweries(): ListBreweriesResult {
  const [trigger, { data, isFetching, isUninitialized }] =
    useLazyListBreweriesQuery()
  return {
    list: async (pagination: Pagination): Promise<unknown> =>
      await trigger(pagination).unwrap(),
    data,
    isFetching,
    isUninitialized,
  }
}

export function useSearchBreweries(): SearchBreweriesResult {
  const [trigger, { isFetching }] = useLazySearchBreweriesQuery()
  return {
    search: async (name: string): Promise<unknown> =>
      await trigger(name).unwrap(),
    isFetching,
  }
}

export function useCreateBrewery(): CreateBreweryResult {
  const [createBrewery, { isLoading }] = useCreateBreweryMutation()
  return {
    create: async (brewery: CreateBreweryRequest): Promise<unknown> =>
      await createBrewery(brewery).unwrap(),
    isLoading,
  }
}

export function useUpdateBrewery(): UpdateBreweryResult {
  const [updateBrewery, { isLoading }] = useUpdateBreweryMutation()
  return {
    update: async (brewery: UpdateBreweryRequest): Promise<unknown> =>
      await updateBrewery(brewery).unwrap(),
    isLoading,
  }
}
