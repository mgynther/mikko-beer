import type { ListStoragesByIf } from "../../core/storage/types"
import { useListStoragesByStyleQuery } from "../../store/storage/api"

const listStoragesByStyle: () => ListStoragesByIf = () => {
  const listStoragesByStyleIf: ListStoragesByIf = {
    useList: (breweryId: string) => {
      const { data, isLoading } = useListStoragesByStyleQuery(breweryId)
      return {
        storages: data,
        isLoading
      }
    }
  }
  return listStoragesByStyleIf
}

export default listStoragesByStyle
