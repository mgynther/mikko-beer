import type { DeleteStorageIf, ListStoragesIf } from "../../core/storage/types"
import { useListStoragesQuery } from "../../store/storage/api"

const listStorages: (
  deleteStorageIf: DeleteStorageIf
) => ListStoragesIf = (
  deleteStorageIf: DeleteStorageIf
) => {
  const listStoragesIf: ListStoragesIf = {
    useList: () => {
      const { data, isLoading } = useListStoragesQuery()
      return {
        storages: data,
        isLoading
      }
    },
    delete: deleteStorageIf
  }
  return listStoragesIf
}

export default listStorages
