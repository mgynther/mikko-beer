import type {
  BeerWithIds,
  UpdateBeerHookIf,
  UseUpdateBeer,
  ValidateBeerWithIds,
} from './types'
import { unwrapMember } from '../envelope'

const updateBeer: (
  useUpdateBeer: UseUpdateBeer,
  validateBeerWithIds: ValidateBeerWithIds,
) => UpdateBeerHookIf = (useUpdateBeer, validateBeerWithIds) => {
  const updateBeerIf: UpdateBeerHookIf = {
    useUpdate: () => {
      const { update, isLoading } = useUpdateBeer()
      return {
        update: async (beer: BeerWithIds): Promise<void> => {
          const result = await update({ ...beer })
          validateBeerWithIds(unwrapMember(result, 'beer'))
        },
        isLoading,
      }
    },
  }
  return updateBeerIf
}

export default updateBeer
