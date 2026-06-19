import type { Beer, SearchBeerHookIf } from '../../core/beer/types'
import { useLazySearchBeersQuery } from '../../store/beer/api'
import { validateBeerList } from '../../validation/beer'
import { formatQuery } from '../search-query'

const searchBeer: () => SearchBeerHookIf = () => {
  const searchBeerIf: SearchBeerHookIf = {
    useSearch: () => {
      const [searchBeers, { isFetching }] = useLazySearchBeersQuery()
      return {
        search: async (query: string): Promise<Beer[]> => {
          const results = await searchBeers(formatQuery(query)).unwrap()
          return validateBeerList(results).beers
        },
        isLoading: isFetching,
      }
    },
  }
  return searchBeerIf
}

export default searchBeer
