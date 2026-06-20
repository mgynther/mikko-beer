import type { Location, UpdateLocationHookIf } from '../../core/location/types'
import { useUpdateLocationMutation } from '../../store/location/api'
import { validateLocation } from '../../validation/location'

const updateLocation: () => UpdateLocationHookIf = () => {
  const updateLocationIf: UpdateLocationHookIf = {
    useUpdate: () => {
      const [updateLocation, { isLoading }] = useUpdateLocationMutation()
      return {
        update: async (locationRequest: Location): Promise<void> => {
          const result = await updateLocation(locationRequest).unwrap()
          validateLocation(result.location)
        },
        isLoading,
      }
    },
  }
  return updateLocationIf
}

export default updateLocation
