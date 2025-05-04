import type {
  CreateLocationIf,
  SearchLocationIf
} from "../../core/location/types"
import { useLazySearchLocationsQuery } from "../../store/location/api"
import { validateLocationList } from "../../validation/location"

const searchLocation: (
  create: CreateLocationIf
) => SearchLocationIf = (create: CreateLocationIf) => {
  const searchLocationIf: SearchLocationIf = {
    useSearch: () => {
      const [
        searchLocation,
        { isFetching }
      ] = useLazySearchLocationsQuery()
      return {
        search: async (name: string) => {
          const result = await searchLocation(name).unwrap()
          return validateLocationList(result).locations
        },
        isLoading: isFetching
      }
    },
    create
  }
  return searchLocationIf
}

export default searchLocation
