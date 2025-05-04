import type { GetLocationIf } from "../../core/location/types"
import { useGetLocationQuery } from "../../store/location/api"
import { validateLocationOrUndefined } from "../../validation/location"

const getLocation: () => GetLocationIf = () => {
  const getLocationIf: GetLocationIf = {
    useGet: (locationId: string) => {
      const { data, isLoading } = useGetLocationQuery(locationId)
      return {
        location: validateLocationOrUndefined(data?.location),
        isLoading
      }
    }
  }
  return getLocationIf
}

export default getLocation
