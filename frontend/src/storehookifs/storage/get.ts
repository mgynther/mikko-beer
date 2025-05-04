import type { GetStorageIf } from "../../core/storage/types"
import { useGetStorageQuery } from "../../store/storage/api"
import { validateStorageOrUndefined } from "../../validation/storage"

const getStorage: () => GetStorageIf = () => {
  const getStorageIf: GetStorageIf = {
    useGet: (storageId: string) => {
      const { data, isLoading } = useGetStorageQuery(storageId)
      return {
        storage: validateStorageOrUndefined(data?.storage),
        isLoading
      }
    }
  }
  return getStorageIf
}

export default getStorage
