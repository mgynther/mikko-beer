import type { ListStoragesByIf } from "../../core/storage/types"
import { useListStoragesByBeerQuery } from "../../store/storage/api"

const listStoragesByBeer: () => ListStoragesByIf = () => {
  const listStoragesByBeerIf: ListStoragesByIf = {
    useList: (beerId: string) => {
      const { data, isLoading } = useListStoragesByBeerQuery(beerId)
      return {
        storages: data,
        isLoading
      }
    }
  }
  return listStoragesByBeerIf
}

export default listStoragesByBeer
