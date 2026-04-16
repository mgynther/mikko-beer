import type {
  BeerWithIds,
  EditBeerIf,
  UpdateBeerIf,
} from '../../core/beer/types'
import { useUpdateBeerMutation } from '../../store/beer/api'
import { validateBeerWithIds } from '../../validation/beer'

const updateBeer: (editBeerIf: EditBeerIf) => UpdateBeerIf = (
  editBeerIf: EditBeerIf,
) => {
  const updateBeerIf: UpdateBeerIf = {
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
    editBeerIf,
  }
  return updateBeerIf
}

export default updateBeer
