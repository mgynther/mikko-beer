import type { BeerWithIds, UpdateBeerHookIf } from '../../core/beer/types'
import { useUpdateBeerMutation } from '../../store/beer/api'
import { validateBeerWithIds } from '../../validation/beer'

const updateBeer: () => UpdateBeerHookIf = () => {
  const updateBeerIf: UpdateBeerHookIf = {
    useUpdate: () => {
      const [updateBeer, { isLoading }] = useUpdateBeerMutation()
      return {
        update: async (beer: BeerWithIds): Promise<void> => {
          const result = await updateBeer({ ...beer }).unwrap()
          validateBeerWithIds(result.beer)
        },
        isLoading,
      }
    },
  }
  return updateBeerIf
}

export default updateBeer
