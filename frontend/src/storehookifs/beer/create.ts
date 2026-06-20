import type {
  BeerWithIds,
  CreateBeerHookIf,
  CreateBeerRequest,
} from '../../core/beer/types'
import { useCreateBeerMutation } from '../../store/beer/api'
import { validateBeerWithIds } from '../../validation/beer'

const createBeer: () => CreateBeerHookIf = () => {
  const createBeerIf: CreateBeerHookIf = {
    useCreate: () => {
      const [createBeer, { isLoading }] = useCreateBeerMutation()
      return {
        create: async (
          beerRequest: CreateBeerRequest,
        ): Promise<BeerWithIds> => {
          const result = await createBeer({
            ...beerRequest,
          }).unwrap()
          return validateBeerWithIds(result.beer)
        },
        isLoading,
      }
    },
  }
  return createBeerIf
}

export default createBeer
