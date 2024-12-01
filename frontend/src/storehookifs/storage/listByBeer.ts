import type {
  DeleteStorageIf,
  ListStoragesByIf
} from "../../core/storage/types"
import { useListStoragesByBeerQuery } from "../../store/storage/api"

const listStoragesByBeer: (
  deleteStorageIf: DeleteStorageIf
) => ListStoragesByIf = (
  deleteStorageIf: DeleteStorageIf
) => {
  const listStoragesByBeerIf: ListStoragesByIf = {
    useList: (beerId: string) => {
      const { data, isLoading } = useListStoragesByBeerQuery(beerId)
      return {
        storages: data,
        isLoading
      }
    },
    delete: deleteStorageIf
  }
  return listStoragesByBeerIf
}

export default listStoragesByBeer
