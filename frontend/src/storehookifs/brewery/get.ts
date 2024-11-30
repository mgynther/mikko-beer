import type { GetBreweryIf } from "../../core/brewery/types"
import { useGetBreweryQuery } from "../../store/brewery/api"

const getBrewery: () => GetBreweryIf = () => {
  const getBreweryIf: GetBreweryIf = {
    useGet: (breweryId: string) => {
      const { data, isLoading } = useGetBreweryQuery(breweryId)
      return {
        brewery: data?.brewery,
        isLoading
      }
    }
  }
  return getBreweryIf
}

export default getBrewery
