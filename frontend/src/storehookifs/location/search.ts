import type { Location, SearchLocationHookIf } from '../../core/location/types'
import { useLazySearchLocationsQuery } from '../../store/location/api'
import { validateLocationList } from '../../validation/location'
import { formatQuery } from '../search-query'

const searchLocation: () => SearchLocationHookIf = () => {
  const searchLocationIf: SearchLocationHookIf = {
    useSearch: () => {
      const [searchLocation, { isFetching }] = useLazySearchLocationsQuery()
      return {
        search: async (name: string): Promise<Location[]> => {
          const result = await searchLocation(formatQuery(name)).unwrap()
          return validateLocationList(result).locations
        },
        isLoading: isFetching,
      }
    },
  }
  return searchLocationIf
}

export default searchLocation
