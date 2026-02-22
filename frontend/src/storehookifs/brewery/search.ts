import type { Brewery, SearchBreweryIf } from "../../core/brewery/types"
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
        search: async (name: string): Promise<Brewery[]> => {
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
