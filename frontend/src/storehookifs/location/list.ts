import type {
  ListLocationsHookIf,
  LocationList,
} from '../../core/location/types'
import type { Pagination } from '../../core/types'
import { useLazyListLocationsQuery } from '../../store/location/api'
import {
  validateLocationList,
  validateLocationListOrUndefined,
} from '../../validation/location'

const listLocations: () => ListLocationsHookIf = () => {
  const listLocationsIf: ListLocationsHookIf = {
    useList: () => {
      const [trigger, { data, isFetching, isUninitialized }] =
        useLazyListLocationsQuery()
      return {
        locationList: validateLocationListOrUndefined(data),
        list: async (pagination: Pagination): Promise<LocationList> => {
          const result = await trigger(pagination).unwrap()
          return validateLocationList(result)
        },
        isLoading: isFetching,
        isUninitialized,
      }
    },
  }
  return listLocationsIf
}

export default listLocations
