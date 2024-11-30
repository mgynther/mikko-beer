import type { GetBeerIf } from "../../core/beer/types"
import { useGetBeerQuery } from "../../store/beer/api"

const getBeer: () => GetBeerIf = () => {
  const getBeerIf: GetBeerIf = {
    useGetBeer: (beerId: string) => {
      const { data, isLoading } = useGetBeerQuery(beerId)
      return {
        beer: data?.beer,
        isLoading
      }
    }
  }
  return getBeerIf
}

export default getBeer
