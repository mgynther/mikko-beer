import type {
  DeleteStorageIf,
  ListStoragesByIf
} from "../../core/storage/types"
import { useListStoragesByStyleQuery } from "../../store/storage/api"

const listStoragesByStyle: (
  deleteStorageIf: DeleteStorageIf
) => ListStoragesByIf = (
  deleteStorageIf: DeleteStorageIf
) => {
  const listStoragesByStyleIf: ListStoragesByIf = {
    useList: (breweryId: string) => {
      const { data, isLoading } = useListStoragesByStyleQuery(breweryId)
      return {
        storages: data,
        isLoading
      }
    },
    delete: deleteStorageIf
  }
  return listStoragesByStyleIf
}

export default listStoragesByStyle
