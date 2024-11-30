import type {
  BeerWithIds,
  CreateBeerIf,
  CreateBeerRequest,
  EditBeerIf
} from "../../core/beer/types"
import { useCreateBeerMutation } from "../../store/beer/api"

const createBeer: (editBeerIf: EditBeerIf) => CreateBeerIf = (
  editBeerIf: EditBeerIf
) => {
  const createBeerIf: CreateBeerIf = {
    useCreate: () => {
      const [
        createBeer,
        { isLoading }
      ] = useCreateBeerMutation()
      return {
        create: async (
          beerRequest: CreateBeerRequest
        ): Promise<BeerWithIds> => {
          const result = await createBeer({
            ...beerRequest
          }).unwrap()
          return result.beer
        },
        isLoading
      }
    },
    editBeerIf
  }
  return createBeerIf
}

export default createBeer
