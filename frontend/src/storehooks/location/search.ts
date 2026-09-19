import type {
  Location,
  SearchLocationHookIf,
  UseSearchLocations,
  ValidateLocationList,
} from './types'
import { formatQuery } from '../search-query'

const searchLocation: (
  useSearchLocations: UseSearchLocations,
  validateLocationList: ValidateLocationList,
) => SearchLocationHookIf = (useSearchLocations, validateLocationList) => {
  const searchLocationIf: SearchLocationHookIf = {
    useSearch: () => {
      const { search, isFetching } = useSearchLocations()
      return {
        search: async (name: string): Promise<Location[]> =>
          validateLocationList(await search(formatQuery(name))).locations,
        isLoading: isFetching,
      }
    },
  }
  return searchLocationIf
}

export default searchLocation
