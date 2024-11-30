import type { Brewery, UpdateBreweryIf } from "../../core/brewery/types"
import { useUpdateBreweryMutation } from "../../store/brewery/api"

const updateBrewery: () => UpdateBreweryIf = () => {
  const updateBreweryIf: UpdateBreweryIf = {
    useUpdate: () => {
      const [
        updateBrewery,
        { isLoading }
      ] = useUpdateBreweryMutation()
      return {
        update: async (
          breweryRequest: Brewery
        ): Promise<void> => {
          await updateBrewery(breweryRequest)
        },
        isLoading
      }
    }
  }
  return updateBreweryIf
}

export default updateBrewery
