import { infiniteScroll } from "../../components/util"
import type { ListLocationsIf } from "../../core/location/types"
import type { Pagination } from "../../core/types"
import { useLazyListLocationsQuery } from "../../store/location/api"

const listLocations: () => ListLocationsIf = () => {
  const listLocationsIf: ListLocationsIf = {
    useList: () => {
      const [trigger, { data, isFetching, isUninitialized } ] =
        useLazyListLocationsQuery()
      return {
        locationList: data,
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
  return listLocationsIf
}

export default listLocations
