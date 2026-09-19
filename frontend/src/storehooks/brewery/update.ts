import type {
  Brewery,
  UpdateBreweryHookIf,
  UseUpdateBrewery,
  ValidateBrewery,
} from './types'
import { unwrapMember } from '../envelope'

const updateBrewery: (
  useUpdateBrewery: UseUpdateBrewery,
  validateBrewery: ValidateBrewery,
) => UpdateBreweryHookIf = (useUpdateBrewery, validateBrewery) => {
  const updateBreweryIf: UpdateBreweryHookIf = {
    useUpdate: () => {
      const { update, isLoading } = useUpdateBrewery()
      return {
        update: async (breweryRequest: Brewery): Promise<void> => {
          const result = await update(breweryRequest)
          validateBrewery(unwrapMember(result, 'brewery'))
        },
        isLoading,
      }
    },
  }
  return updateBreweryIf
}

export default updateBrewery
