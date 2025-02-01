import type { Location, UpdateLocationIf } from "../../core/location/types"
import type { GetLogin } from "../../core/login/types"
import { useUpdateLocationMutation } from "../../store/location/api"

const updateLocation: (
  login: GetLogin
) => UpdateLocationIf = (login: GetLogin) => {
  const updateLocationIf: UpdateLocationIf = {
    useUpdate: () => {
      const [
        updateLocation,
        { isLoading }
      ] = useUpdateLocationMutation()
      return {
        update: async (
          locationRequest: Location
        ): Promise<void> => {
          await updateLocation(locationRequest)
        },
        isLoading
      }
    },
    login
  }
  return updateLocationIf
}

export default updateLocation
