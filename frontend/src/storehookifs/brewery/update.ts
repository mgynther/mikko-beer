import type { Brewery, UpdateBreweryIf } from '../../core/brewery/types'
import { useUpdateBreweryMutation } from '../../store/brewery/api'
import { validateBrewery } from '../../validation/brewery'

const updateBrewery: () => UpdateBreweryIf = () => {
  const updateBreweryIf: UpdateBreweryIf = {
    useUpdate: () => {
      const [updateBrewery, { isLoading }] = useUpdateBreweryMutation()
      return {
        update: async (breweryRequest: Brewery): Promise<void> => {
          const result = await updateBrewery(breweryRequest).unwrap()
          validateBrewery(result.brewery)
        },
        isLoading,
      }
    },
  }
  return updateBreweryIf
}

export default updateBrewery
