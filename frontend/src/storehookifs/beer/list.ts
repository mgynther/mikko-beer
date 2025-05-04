import { infiniteScroll } from "../../components/util"
import type { ListBeersIf } from "../../core/beer/types"
import type { Pagination } from "../../core/types"
import { useLazyListBeersQuery } from "../../store/beer/api"
import {
  validateBeerList,
  validateBeerListOrUndefined
} from "../../validation/beer"

const listBeers: () => ListBeersIf = () => {
  const listBeersIf: ListBeersIf = {
    useList: () => {
      const [trigger, { data, isFetching, isUninitialized } ] =
        useLazyListBeersQuery()
      return {
        beerList: validateBeerListOrUndefined(data),
        list: async (pagination: Pagination) => {
          const result = await trigger(pagination).unwrap()
          return validateBeerList(result)
        },
        isLoading: isFetching,
        isUninitialized
      }
    },
    infiniteScroll
  }
  return listBeersIf
}

export default listBeers
