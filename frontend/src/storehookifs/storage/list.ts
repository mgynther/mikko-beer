import type { DeleteStorageIf, ListStoragesIf } from "../../core/storage/types"
import { useListStoragesQuery } from "../../store/storage/api"
import { validateStorageListOrUndefined } from "../../validation/storage"

const listStorages: (
  deleteStorageIf: DeleteStorageIf
) => ListStoragesIf = (
  deleteStorageIf: DeleteStorageIf
) => {
  const listStoragesIf: ListStoragesIf = {
    useList: () => {
      const { data, isLoading } = useListStoragesQuery()
      return {
        storages: validateStorageListOrUndefined(data),
        isLoading
      }
    },
    delete: deleteStorageIf
  }
  return listStoragesIf
}

export default listStorages
