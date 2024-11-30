import { infiniteScroll } from "../../components/util"
import type { ListBeersIf } from "../../core/beer/types"
import type { Pagination } from "../../core/types"
import { useLazyListBeersQuery } from "../../store/beer/api"

const listBeers: () => ListBeersIf = () => {
  const listBeersIf: ListBeersIf = {
    useList: () => {
      const [trigger, { data, isFetching, isUninitialized } ] =
        useLazyListBeersQuery()
      return {
        beerList: data,
        list: async (pagination: Pagination) => {
          const result = await trigger(pagination).unwrap()
          return result
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
