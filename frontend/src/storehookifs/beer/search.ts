import type { SearchBeerIf } from "../../core/beer/types"
import { useLazySearchBeersQuery } from "../../store/beer/api"

const searchBeer: () => SearchBeerIf = () => {
  const searchBeerIf: SearchBeerIf = {
    useSearch: () => {
      const [ searchBeers, { isFetching } ] = useLazySearchBeersQuery()
      return {
        search: async (query: string) => {
          const results = await searchBeers(query).unwrap()
          return results.beers
        },
        isLoading: isFetching
      }
    }
  }
  return searchBeerIf
}

export default searchBeer
