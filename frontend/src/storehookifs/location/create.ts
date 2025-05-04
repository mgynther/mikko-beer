import type {
  Location,
  CreateLocationIf,
  CreateLocationRequest
} from "../../core/location/types"
import { useCreateLocationMutation } from "../../store/location/api"
import { validateLocation } from "../../validation/location"

const createLocation: () => CreateLocationIf = () => {
  const createLocationIf: CreateLocationIf = {
    useCreate: () => {
      const [
        createLocation,
        { isLoading }
      ] = useCreateLocationMutation()
      return {
        create: async (
          locationRequest: CreateLocationRequest
        ): Promise<Location> => {
          const result = await createLocation(locationRequest).unwrap()
          return validateLocation(result.location)
        },
        isLoading
      }
    }
  }
  return createLocationIf
}

export default createLocation
