import type { SearchBreweryIf } from "../../core/brewery/types"
import { useLazySearchBreweriesQuery } from "../../store/brewery/api"

const searchBrewery: () => SearchBreweryIf = () => {
  const searchBreweryIf: SearchBreweryIf = {
    useSearch: () => {
      const [
        searchBrewery,
        { isFetching }
      ] = useLazySearchBreweriesQuery()
      return {
        search: async (name: string) => {
          const result = await searchBrewery(name).unwrap()
          return result.breweries
        },
        isLoading: isFetching
      }
    }
  }
  return searchBreweryIf
}

export default searchBrewery
