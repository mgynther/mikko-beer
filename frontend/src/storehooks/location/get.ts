import type {
  GetLocationHookIf,
  UseGetLocation,
  ValidateLocationOrUndefined,
} from './types'
import { unwrapMemberOrUndefined } from '../envelope'

const getLocation: (
  useGetLocation: UseGetLocation,
  validateLocationOrUndefined: ValidateLocationOrUndefined,
) => GetLocationHookIf = (useGetLocation, validateLocationOrUndefined) => {
  const getLocationIf: GetLocationHookIf = {
    useGet: (locationId: string) => {
      const { data, isLoading } = useGetLocation(locationId)
      return {
        location: validateLocationOrUndefined(
          unwrapMemberOrUndefined(data, 'location'),
        ),
        isLoading,
      }
    },
  }
  return getLocationIf
}

export default getLocation
