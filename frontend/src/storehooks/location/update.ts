import type {
  Location,
  UpdateLocationHookIf,
  UseUpdateLocation,
  ValidateLocation,
} from './types'
import { unwrapMember } from '../envelope'

const updateLocation: (
  useUpdateLocation: UseUpdateLocation,
  validateLocation: ValidateLocation,
) => UpdateLocationHookIf = (useUpdateLocation, validateLocation) => {
  const updateLocationIf: UpdateLocationHookIf = {
    useUpdate: () => {
      const { update, isLoading } = useUpdateLocation()
      return {
        update: async (locationRequest: Location): Promise<void> => {
          const result = await update(locationRequest)
          validateLocation(unwrapMember(result, 'location'))
        },
        isLoading,
      }
    },
  }
  return updateLocationIf
}

export default updateLocation
