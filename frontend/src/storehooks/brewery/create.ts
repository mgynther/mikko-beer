import type {
  Brewery,
  CreateBreweryHookIf,
  CreateBreweryRequest,
  UseCreateBrewery,
  ValidateBrewery,
} from './types'
import { unwrapMember } from '../envelope'

const createBrewery: (
  useCreateBrewery: UseCreateBrewery,
  validateBrewery: ValidateBrewery,
) => CreateBreweryHookIf = (useCreateBrewery, validateBrewery) => {
  const createBreweryIf: CreateBreweryHookIf = {
    useCreate: () => {
      const { create, isLoading } = useCreateBrewery()
      return {
        create: async (
          breweryRequest: CreateBreweryRequest,
        ): Promise<Brewery> => {
          const result = await create(breweryRequest)
          return validateBrewery(unwrapMember(result, 'brewery'))
        },
        isLoading,
      }
    },
  }
  return createBreweryIf
}

export default createBrewery
