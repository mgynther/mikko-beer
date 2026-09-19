import type {
  CreateLocationHookIf,
  CreateLocationRequest,
  Location,
  UseCreateLocation,
  ValidateLocation,
} from './types'
import { unwrapMember } from '../envelope'

const createLocation: (
  useCreateLocation: UseCreateLocation,
  validateLocation: ValidateLocation,
) => CreateLocationHookIf = (useCreateLocation, validateLocation) => {
  const createLocationIf: CreateLocationHookIf = {
    useCreate: () => {
      const { create, isLoading } = useCreateLocation()
      return {
        create: async (
          locationRequest: CreateLocationRequest,
        ): Promise<Location> => {
          const result = await create(locationRequest)
          return validateLocation(unwrapMember(result, 'location'))
        },
        isLoading,
      }
    },
  }
  return createLocationIf
}

export default createLocation
