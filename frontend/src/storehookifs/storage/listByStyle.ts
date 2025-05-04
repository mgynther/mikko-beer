import type {
  DeleteStorageIf,
  ListStoragesByIf
} from "../../core/storage/types"
import { useListStoragesByStyleQuery } from "../../store/storage/api"
import { validateStorageListOrUndefined } from "../../validation/storage"

const listStoragesByStyle: (
  deleteStorageIf: DeleteStorageIf
) => ListStoragesByIf = (
  deleteStorageIf: DeleteStorageIf
) => {
  const listStoragesByStyleIf: ListStoragesByIf = {
    useList: (breweryId: string) => {
      const { data, isLoading } = useListStoragesByStyleQuery(breweryId)
      return {
        storages: validateStorageListOrUndefined(data),
        isLoading
      }
    },
    delete: deleteStorageIf
  }
  return listStoragesByStyleIf
}

export default listStoragesByStyle
