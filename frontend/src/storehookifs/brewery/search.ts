import type { SearchBreweryIf } from "../../core/brewery/types"
import { useLazySearchBreweriesQuery } from "../../store/brewery/api"
import { validateBreweryList } from "../../validation/brewery"
import { formatQuery } from "../search-query"

const searchBrewery: () => SearchBreweryIf = () => {
  const searchBreweryIf: SearchBreweryIf = {
    useSearch: () => {
      const [
        searchBrewery,
        { isFetching }
      ] = useLazySearchBreweriesQuery()
      return {
        search: async (name: string) => {
          const result = await searchBrewery(formatQuery(name)).unwrap()
          return validateBreweryList(result).breweries
        },
        isLoading: isFetching
      }
    }
  }
  return searchBreweryIf
}

export default searchBrewery
