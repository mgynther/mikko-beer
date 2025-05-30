import { infiniteScroll } from "../../components/util"
import type { ListBreweriesIf } from "../../core/brewery/types"
import type { Pagination } from "../../core/types"
import { useLazyListBreweriesQuery } from "../../store/brewery/api"
import {
  validateBreweryList,
  validateBreweryListOrUndefined
} from "../../validation/brewery"

const listBreweries: () => ListBreweriesIf = () => {
  const listBreweriesIf: ListBreweriesIf = {
    useList: () => {
      const [trigger, { data, isFetching, isUninitialized } ] =
        useLazyListBreweriesQuery()
      return {
        breweryList: validateBreweryListOrUndefined(data),
        list: async (pagination: Pagination) => {
          const result = await trigger(pagination).unwrap()
          return validateBreweryList(result)
        },
        isLoading: isFetching,
        isUninitialized
      }
    },
    infiniteScroll
  }
  return listBreweriesIf
}

export default listBreweries
