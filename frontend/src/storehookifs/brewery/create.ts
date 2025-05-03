import type {
  Brewery,
  CreateBreweryIf,
  CreateBreweryRequest
} from "../../core/brewery/types"
import { useCreateBreweryMutation } from "../../store/brewery/api"
import { validateBrewery } from "../../validation/brewery"

const createBrewery: () => CreateBreweryIf = () => {
  const createBreweryIf: CreateBreweryIf = {
    useCreate: () => {
      const [
        createBrewery,
        { isLoading }
      ] = useCreateBreweryMutation()
      return {
        create: async (
          breweryRequest: CreateBreweryRequest
        ): Promise<Brewery> => {
          const result = await createBrewery(breweryRequest).unwrap()
          return validateBrewery(result.brewery)
        },
        isLoading
      }
    }
  }
  return createBreweryIf
}

export default createBrewery
