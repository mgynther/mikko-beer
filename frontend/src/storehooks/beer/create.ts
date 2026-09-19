import type {
  BeerWithIds,
  CreateBeerHookIf,
  CreateBeerRequest,
  UseCreateBeer,
  ValidateBeerWithIds,
} from './types'
import { unwrapMember } from '../envelope'

const createBeer: (
  useCreateBeer: UseCreateBeer,
  validateBeerWithIds: ValidateBeerWithIds,
) => CreateBeerHookIf = (useCreateBeer, validateBeerWithIds) => {
  const createBeerIf: CreateBeerHookIf = {
    useCreate: () => {
      const { create, isLoading } = useCreateBeer()
      return {
        create: async (
          beerRequest: CreateBeerRequest,
        ): Promise<BeerWithIds> => {
          const result = await create({
            ...beerRequest,
          })
          return validateBeerWithIds(unwrapMember(result, 'beer'))
        },
        isLoading,
      }
    },
  }
  return createBeerIf
}

export default createBeer
