import type {
  Beer,
  SearchBeerHookIf,
  UseSearchBeers,
  ValidateBeerList,
} from './types'
import { formatQuery } from '../search-query'

const searchBeer: (
  useSearchBeers: UseSearchBeers,
  validateBeerList: ValidateBeerList,
) => SearchBeerHookIf = (useSearchBeers, validateBeerList) => {
  const searchBeerIf: SearchBeerHookIf = {
    useSearch: () => {
      const { search, isFetching } = useSearchBeers()
      return {
        search: async (query: string): Promise<Beer[]> =>
          validateBeerList(await search(formatQuery(query))).beers,
        isLoading: isFetching,
      }
    },
  }
  return searchBeerIf
}

export default searchBeer
