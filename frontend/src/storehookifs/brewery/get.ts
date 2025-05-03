import type { GetBreweryIf } from "../../core/brewery/types"
import { useGetBreweryQuery } from "../../store/brewery/api"
import { validateBreweryOrUndefined } from "../../validation/brewery"

const getBrewery: () => GetBreweryIf = () => {
  const getBreweryIf: GetBreweryIf = {
    useGet: (breweryId: string) => {
      const { data, isLoading } = useGetBreweryQuery(breweryId)
      const validBrewery = validateBreweryOrUndefined(data?.brewery)
      return {
        brewery: validBrewery,
        isLoading
      }
    }
  }
  return getBreweryIf
}

export default getBrewery
