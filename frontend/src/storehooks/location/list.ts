import type {
  ListLocationsHookIf,
  LocationList,
  UseListLocations,
  ValidateLocationList,
  ValidateLocationListOrUndefined,
} from './types'
import type { Pagination } from '../types'

const listLocations: (
  useListLocations: UseListLocations,
  validateLocationList: ValidateLocationList,
  validateLocationListOrUndefined: ValidateLocationListOrUndefined,
) => ListLocationsHookIf = (
  useListLocations,
  validateLocationList,
  validateLocationListOrUndefined,
) => {
  const listLocationsIf: ListLocationsHookIf = {
    useList: () => {
      const { list, data, isFetching, isUninitialized } = useListLocations()
      return {
        locationList: validateLocationListOrUndefined(data),
        list: async (pagination: Pagination): Promise<LocationList> =>
          validateLocationList(await list(pagination)),
        isLoading: isFetching,
        isUninitialized,
      }
    },
  }
  return listLocationsIf
}

export default listLocations
