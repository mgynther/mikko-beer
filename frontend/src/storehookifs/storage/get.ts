import type { GetStorageIf } from "../../core/storage/types"
import { useGetStorageQuery } from "../../store/storage/api"

const getStorage: () => GetStorageIf = () => {
  const getStorageIf: GetStorageIf = {
    useGet: (storageId: string) => {
      const { data, isLoading } = useGetStorageQuery(storageId)
      return {
        storage: data?.storage,
        isLoading
      }
    }
  }
  return getStorageIf
}

export default getStorage
