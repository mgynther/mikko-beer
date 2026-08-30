import { infiniteScroll } from '../../components/util'
import type { BreweryList, ListBreweriesIf } from '../../types/brewery/types'
import type { Pagination } from '../../types/types'
import { useLazyListBreweriesQuery } from '../../store/brewery/api'
import {
  validateBreweryList,
  validateBreweryListOrUndefined,
} from '../../validation/brewery'

const listBreweries: () => ListBreweriesIf = () => {
  const listBreweriesIf: ListBreweriesIf = {
    useList: () => {
      const [trigger, { data, isFetching, isUninitialized }] =
        useLazyListBreweriesQuery()
      return {
        breweryList: validateBreweryListOrUndefined(data),
        list: async (pagination: Pagination): Promise<BreweryList> => {
          const result = await trigger(pagination).unwrap()
          return validateBreweryList(result)
        },
        isLoading: isFetching,
        isUninitialized,
      }
    },
    infiniteScroll,
  }
  return listBreweriesIf
}

export default listBreweries
