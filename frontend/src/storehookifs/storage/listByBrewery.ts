import type { ListStoragesByIf } from "../../core/storage/types"
import { useListStoragesByBreweryQuery } from "../../store/storage/api"

const listStoragesByBrewery: () => ListStoragesByIf = () => {
  const listStoragesByBreweryIf: ListStoragesByIf = {
    useList: (breweryId: string) => {
      const { data, isLoading } = useListStoragesByBreweryQuery(breweryId)
      return {
        storages: data,
        isLoading
      }
    }
  }
  return listStoragesByBreweryIf
}

export default listStoragesByBrewery
