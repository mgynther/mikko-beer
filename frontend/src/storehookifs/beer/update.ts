import type {
  BeerWithIds,
  EditBeerIf,
  UpdateBeerIf
} from "../../core/beer/types"
import { useUpdateBeerMutation } from "../../store/beer/api"

const updateBeer: (editBeerIf: EditBeerIf) => UpdateBeerIf = (
  editBeerIf: EditBeerIf
) => {
  const updateBeerIf: UpdateBeerIf = {
    useUpdate: () => {
      const [updateBeer, { isLoading }] =
        useUpdateBeerMutation()
      return {
        update: async (beer: BeerWithIds): Promise<void> => {
          await updateBeer({ ...beer })
        },
        isLoading
      }
    },
    editBeerIf
  }
  return updateBeerIf
}

export default updateBeer
