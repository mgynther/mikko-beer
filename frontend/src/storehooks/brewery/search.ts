import type {
  Brewery,
  SearchBreweryHookIf,
  UseSearchBreweries,
  ValidateBreweryList,
} from './types'
import { formatQuery } from '../search-query'

const searchBrewery: (
  useSearchBreweries: UseSearchBreweries,
  validateBreweryList: ValidateBreweryList,
) => SearchBreweryHookIf = (useSearchBreweries, validateBreweryList) => {
  const searchBreweryIf: SearchBreweryHookIf = {
    useSearch: () => {
      const { search, isFetching } = useSearchBreweries()
      return {
        search: async (name: string): Promise<Brewery[]> =>
          validateBreweryList(await search(formatQuery(name))).breweries,
        isLoading: isFetching,
      }
    },
  }
  return searchBreweryIf
}

export default searchBrewery
