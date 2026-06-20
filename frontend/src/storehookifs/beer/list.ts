import type { BeerList, ListBeersHookIf } from '../../core/beer/types'
import type { Pagination } from '../../core/types'
import { useLazyListBeersQuery } from '../../store/beer/api'
import {
  validateBeerList,
  validateBeerListOrUndefined,
} from '../../validation/beer'

const listBeers: () => ListBeersHookIf = () => {
  const listBeersIf: ListBeersHookIf = {
    useList: () => {
      const [trigger, { data, isFetching, isUninitialized }] =
        useLazyListBeersQuery()
      return {
        beerList: validateBeerListOrUndefined(data),
        list: async (pagination: Pagination): Promise<BeerList> => {
          const result = await trigger(pagination).unwrap()
          return validateBeerList(result)
        },
        isLoading: isFetching,
        isUninitialized,
      }
    },
  }
  return listBeersIf
}

export default listBeers
