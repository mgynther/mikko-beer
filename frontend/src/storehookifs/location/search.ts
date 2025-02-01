import type {
  CreateLocationIf,
  SearchLocationIf
} from "../../core/location/types"
import { useLazySearchLocationsQuery } from "../../store/location/api"

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
          return result.locations
        },
        isLoading: isFetching
      }
    },
    create
  }
  return searchLocationIf
}

export default searchLocation
