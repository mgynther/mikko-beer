import type { Pagination } from './internal/pagination'
import type {
  CreateBeerRequest,
  UpdateBeerRequest,
} from './internal/beer/requests'
import {
  useCreateBeerMutation,
  useGetBeerQuery,
  useLazyListBeersQuery,
  useLazySearchBeersQuery,
  useUpdateBeerMutation,
} from './internal/beer/api'

// The public surface of the beer endpoints. Every result is built here as a
// new object rather than handed on as the query hook returned it: what the
// caller gets at runtime is then exactly what these types say it is, instead
// of everything RTK Query happens to put on its result. The data stays
// unknown, because the store still does not claim to know what the backend
// returned.
export interface GetBeerResult {
  data: unknown
  isLoading: boolean
}

export interface ListBeersResult {
  list: (pagination: Pagination) => Promise<unknown>
  data: unknown
  isFetching: boolean
  isUninitialized: boolean
}

export interface SearchBeersResult {
  search: (name: string) => Promise<unknown>
  isFetching: boolean
}

export interface CreateBeerResult {
  create: (beer: CreateBeerRequest) => Promise<unknown>
  isLoading: boolean
}

export interface UpdateBeerResult {
  update: (beer: UpdateBeerRequest) => Promise<unknown>
  isLoading: boolean
}

export function useGetBeer(beerId: string): GetBeerResult {
  const { data, isLoading } = useGetBeerQuery(beerId)
  return {
    data,
    isLoading,
  }
}

export function useListBeers(): ListBeersResult {
  const [trigger, { data, isFetching, isUninitialized }] =
    useLazyListBeersQuery()
  return {
    list: async (pagination: Pagination): Promise<unknown> =>
      await trigger(pagination).unwrap(),
    data,
    isFetching,
    isUninitialized,
  }
}

export function useSearchBeers(): SearchBeersResult {
  const [trigger, { isFetching }] = useLazySearchBeersQuery()
  return {
    search: async (name: string): Promise<unknown> =>
      await trigger(name).unwrap(),
    isFetching,
  }
}

export function useCreateBeer(): CreateBeerResult {
  const [createBeer, { isLoading }] = useCreateBeerMutation()
  return {
    create: async (beer: CreateBeerRequest): Promise<unknown> =>
      await createBeer(beer).unwrap(),
    isLoading,
  }
}

export function useUpdateBeer(): UpdateBeerResult {
  const [updateBeer, { isLoading }] = useUpdateBeerMutation()
  return {
    update: async (beer: UpdateBeerRequest): Promise<unknown> =>
      await updateBeer(beer).unwrap(),
    isLoading,
  }
}
