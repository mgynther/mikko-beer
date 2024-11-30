import type { ListStoragesIf } from "../../core/storage/types"
import { useListStoragesQuery } from "../../store/storage/api"

const listStorages: () => ListStoragesIf = () => {
  const listStoragesIf: ListStoragesIf = {
    useList: () => {
      const { data, isLoading } = useListStoragesQuery()
      return {
        storages: data,
        isLoading
      }
    }
  }
  return listStoragesIf
}

export default listStorages
